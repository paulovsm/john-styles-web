import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserProfileContext } from '../contexts/UserProfileContext';
import { geminiService } from '../services/api/geminiService';
import { colorToHex } from '../utils/colorMap';
import Loading from '../components/common/Loading';
import { Close } from '@mui/icons-material';
import { ARCHETYPES, inferArchetypes } from '../utils/archetypes';
import { STORAGE_KEYS } from '../services/storage/localStorageService';

// Option catalogs. `value` is the canonical (PT) token stored on the profile so
// it matches the wardrobe/sample color names; the label is translated via i18n.
const COLORS = [
    { id: 'black', value: 'Preto' }, { id: 'white', value: 'Branco' }, { id: 'gray', value: 'Cinza' },
    { id: 'blue', value: 'Azul' }, { id: 'navy', value: 'Azul marinho' }, { id: 'beige', value: 'Bege' },
    { id: 'brown', value: 'Marrom' }, { id: 'green', value: 'Verde' }, { id: 'red', value: 'Vermelho' },
    { id: 'wine', value: 'Vinho' }, { id: 'pink', value: 'Rosa' }, { id: 'purple', value: 'Roxo' },
];
const OCCASIONS = [
    { id: 'work', value: 'trabalho' }, { id: 'businessCasual', value: 'casual executivo' },
    { id: 'everyday', value: 'dia a dia' }, { id: 'party', value: 'festa' },
    { id: 'sport', value: 'esporte' }, { id: 'date', value: 'encontro' },
];
const BODY_TYPES = [
    { id: 'athletic', value: 'Atlético' }, { id: 'slim', value: 'Magro' }, { id: 'average', value: 'Médio' },
    { id: 'plus', value: 'Plus size' }, { id: 'unspecified', value: '' },
];
const DISLIKES = [
    { id: 'brightColors', value: 'cores vivas' }, { id: 'tightClothes', value: 'roupas justas' },
    { id: 'bigPrints', value: 'estampas grandes' }, { id: 'largeLogos', value: 'logos grandes' },
    { id: 'formalwear', value: 'roupas muito formais' },
];

const STEPS = ['archetypes', 'colors', 'occasions', 'body', 'dislikes', 'review'];

// Normalize values (possibly from the AI in a different case, e.g. "azul") to
// the wizard's canonical option values so chips highlight/match correctly.
const canon = (values, options) =>
    (values || []).map((v) => {
        const match = options.find((o) => o.value.toLowerCase() === String(v).toLowerCase());
        return match ? match.value : v;
    });
const canonOne = (value, options) => {
    const match = options.find((o) => o.value && o.value.toLowerCase() === String(value || '').toLowerCase());
    return match ? match.value : (value || '');
};

// Registered in STORAGE_KEYS so the user-switch wipe in clearLocalData()
// picks it up — an abandoned draft must not pre-fill the next user's answers.
const DRAFT_KEY = STORAGE_KEYS.ONBOARDING_DRAFT;

function initSelection(profile) {
    return {
        archetypes: profile.styleArchetypes || [],
        favoriteColors: canon(profile.favoriteColors, COLORS),
        occasions: canon(profile.occasions, OCCASIONS),
        bodyType: canonOne(profile.bodyType, BODY_TYPES),
        dislikes: canon(profile.dislikes, DISLIKES),
        preferredItems: profile.preferredItems || [],
        favoriteBrands: profile.favoriteBrands || [],
        styleGoals: profile.styleGoals || '',
    };
}

export default function OnboardingPage() {
    const { t } = useTranslation();
    const { profile, updateProfile } = useUserProfileContext();
    const navigate = useNavigate();

    // Restore an in-progress draft — iOS silently evicts backgrounded tabs, and
    // without this the user loses every answer if they leave mid-flow.
    const draft = (() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const [step, setStep] = useState(() => draft?.step ?? 0);
    const [sel, setSel] = useState(() => ({ ...initSelection(profile), ...(draft?.sel || {}) }));

    // Persist the draft on every change.
    useEffect(() => {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, sel }));
        } catch {
            // Best-effort; storage may be full or blocked (private mode).
        }
    }, [step, sel]);
    // AI free-text escape hatch
    const [aiOpen, setAiOpen] = useState(false);
    const [aiText, setAiText] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    const toggle = (field, value) => {
        setSel((s) => {
            const arr = s[field] || [];
            return { ...s, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
        });
    };
    const setField = (field, value) => setSel((s) => ({ ...s, [field]: value }));

    const stepId = STEPS[step];
    const isLast = step === STEPS.length - 1;
    const progress = Math.round(((step + 1) / STEPS.length) * 100);

    const finish = () => {
        // Derive preferred items from chosen archetypes (helps recommendations).
        const derivedItems = [...new Set([
            ...sel.preferredItems,
            ...sel.archetypes.flatMap((id) => ARCHETYPES.find((a) => a.id === id)?.items || []),
        ])];
        updateProfile({
            favoriteColors: sel.favoriteColors,
            occasions: sel.occasions,
            bodyType: sel.bodyType,
            dislikes: sel.dislikes,
            favoriteBrands: sel.favoriteBrands,
            styleGoals: sel.styleGoals,
            preferredItems: derivedItems,
            styleArchetypes: sel.archetypes,
            onboardingCompleted: true,
        });
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        navigate('/dashboard');
    };

    const runAI = async () => {
        if (!aiText.trim()) return;
        setAiLoading(true);
        setAiError('');
        try {
            const data = await geminiService.analyzeProfile(aiText);
            const inferred = inferArchetypes(data);
            setSel((s) => ({
                ...s,
                archetypes: s.archetypes.length ? s.archetypes : inferred,
                favoriteColors: data.favoriteColors ? canon(data.favoriteColors, COLORS) : s.favoriteColors,
                preferredItems: data.preferredItems || s.preferredItems,
                occasions: data.occasions ? canon(data.occasions, OCCASIONS) : s.occasions,
                dislikes: data.dislikes ? canon(data.dislikes, DISLIKES) : s.dislikes,
                bodyType: data.bodyType ? canonOne(data.bodyType, BODY_TYPES) : s.bodyType,
                favoriteBrands: data.favoriteBrands || s.favoriteBrands,
                styleGoals: data.styleGoals || s.styleGoals,
            }));
            setAiOpen(false);
            setStep(STEPS.length - 1); // jump to review
        } catch (err) {
            setAiError(err?.message || t('onboarding.error'));
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <main id="main-content" tabIndex={-1} className="min-h-screen bg-white-off flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white-pure p-8 rounded-2xl shadow-lg border border-grey-light">
                {/* Header + progress */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-serif font-bold text-brand-navy">{t('onboarding.title')}</h1>
                        <span className="text-xs text-grey-medium">{t('onboarding.stepOf', { current: step + 1, total: STEPS.length })}</span>
                    </div>
                    <div className="h-1.5 bg-grey-light rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gold transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="min-h-[320px]">
                    <h2 className="text-lg font-serif font-bold text-brand-navy">{t(`onboarding.steps.${stepId}.title`)}</h2>
                    <p className="text-sm text-grey-medium mb-4">{t(`onboarding.steps.${stepId}.subtitle`)}</p>

                    {stepId === 'archetypes' && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {ARCHETYPES.map((a) => {
                                    const active = sel.archetypes.includes(a.id);
                                    return (
                                        <button key={a.id} type="button" onClick={() => toggle('archetypes', a.id)}
                                            className={`min-h-11 text-left p-3 rounded-xl border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy ${active ? 'border-brand-gold bg-brand-gold/10' : 'border-control-border hover:border-grey-medium'}`}>
                                            <span className="block font-medium text-brand-navy">{t(`onboarding.archetypes.${a.id}.label`)}</span>
                                            <span className="block text-xs text-grey-medium mt-0.5">{t(`onboarding.archetypes.${a.id}.desc`)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <button type="button" onClick={() => setAiOpen((v) => !v)} className="mt-4 min-h-11 rounded-md text-sm text-brand-gold-dark hover:bg-grey-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy">
                                {t('onboarding.describeWithAI', 'Prefere descrever com suas palavras?')}
                            </button>
                            {aiOpen && (
                                <div className="mt-3 space-y-2">
                                    <textarea value={aiText} onChange={(e) => setAiText(e.target.value)} disabled={aiLoading}
                                        placeholder={t('onboarding.placeholder')}
                                        className="theme-control w-full h-28 p-3 border border-control-border rounded-lg bg-white-pure text-grey-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy resize-none" />
                                    {aiError && <p className="text-status-error-content text-sm">{aiError}</p>}
                                    <button type="button" onClick={runAI} disabled={!aiText.trim() || aiLoading}
                                        className="inline-flex min-h-11 items-center px-4 py-2 rounded-lg bg-brand-navy text-white-pure text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2">
                                        {aiLoading && <Loading type="spinner" size={16} className="mr-2" />}
                                        {aiLoading ? t('onboarding.analyzing') : t('onboarding.analyzeButton')}
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {stepId === 'colors' && (
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map((c) => {
                                const active = sel.favoriteColors.includes(c.value);
                                return (
                                    <button key={c.id} type="button" onClick={() => toggle('favoriteColors', c.value)}
                                        className={`inline-flex min-h-11 items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy ${active ? 'border-brand-gold bg-brand-gold/10' : 'border-control-border hover:border-grey-medium'}`}>
                                        <span className="w-5 h-5 rounded-full border border-grey-light" style={{ backgroundColor: colorToHex(c.value) || '#ccc' }} />
                                        <span className="text-sm text-brand-navy">{t(`onboarding.colors.${c.id}`)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {stepId === 'occasions' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {OCCASIONS.map((o) => {
                                const active = sel.occasions.includes(o.value);
                                return (
                                    <button key={o.id} type="button" onClick={() => toggle('occasions', o.value)}
                                        className={`min-h-11 p-3 rounded-xl border-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy ${active ? 'border-brand-gold bg-brand-gold/10 text-brand-navy' : 'border-control-border text-grey-dark hover:border-grey-medium'}`}>
                                        {t(`onboarding.occasionOptions.${o.id}`)}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {stepId === 'body' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {BODY_TYPES.map((b) => {
                                const active = sel.bodyType === b.value;
                                return (
                                    <button key={b.id} type="button" onClick={() => setField('bodyType', b.value)}
                                        className={`min-h-11 p-3 rounded-xl border-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy ${active ? 'border-brand-gold bg-brand-gold/10 text-brand-navy' : 'border-control-border text-grey-dark hover:border-grey-medium'}`}>
                                        {t(`onboarding.bodyTypes.${b.id}`)}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {stepId === 'dislikes' && (
                        <div className="flex flex-wrap gap-3">
                            {DISLIKES.map((d) => {
                                const active = sel.dislikes.includes(d.value);
                                return (
                                    <button key={d.id} type="button" onClick={() => toggle('dislikes', d.value)}
                                        className={`min-h-11 px-3 py-1.5 rounded-full border-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy ${active ? 'border-status-error bg-status-error/10 text-status-error-content' : 'border-control-border text-grey-dark hover:border-grey-medium'}`}>
                                        {t(`onboarding.dislikeOptions.${d.id}`)}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {stepId === 'review' && (
                        <div className="space-y-4">
                            <ReviewChips label={t('onboarding.favoriteColors')} items={sel.favoriteColors} onRemove={(v) => toggle('favoriteColors', v)} />
                            <ReviewChips label={t('onboarding.occasions')} items={sel.occasions} onRemove={(v) => toggle('occasions', v)} />
                            <ReviewChips label={t('onboarding.dislikes')} items={sel.dislikes} onRemove={(v) => toggle('dislikes', v)} />
                            <div>
                                <h3 className="font-medium text-sm text-grey-medium uppercase tracking-wide mb-1">{t('onboarding.styleGoals')}</h3>
                                <textarea value={sel.styleGoals} onChange={(e) => setField('styleGoals', e.target.value)}
                                    placeholder={t('onboarding.goalsPlaceholder', 'Ex.: Quero um visual casual e confortável para o trabalho.')}
                                    className="theme-control w-full h-24 p-3 border border-control-border rounded-lg bg-white-pure text-grey-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy resize-none" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <div className="mt-6 flex items-center justify-between gap-3">
                    <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
                        className="min-h-11 px-4 py-2.5 rounded-lg text-brand-navy font-medium disabled:opacity-40 hover:bg-grey-light/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy">
                        {t('onboarding.back', 'Voltar')}
                    </button>
                    <div className="flex items-center gap-3">
                        {!isLast && (
                            <button type="button" onClick={() => setStep((s) => s + 1)} className="min-h-11 rounded-md px-2 text-sm text-grey-medium hover:bg-grey-light hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy">
                                {t('onboarding.skip', 'Pular')}
                            </button>
                        )}
                        <button type="button" onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
                            className="min-h-11 px-6 py-2.5 rounded-lg bg-brand-navy text-white-pure font-medium hover:bg-opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2">
                            {isLast ? t('onboarding.saveButton') : t('onboarding.next', 'Continuar')}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

function ReviewChips({ label, items, onRemove }) {
    const { t } = useTranslation();
    if (!items || items.length === 0) return null;
    return (
        <div>
            <h3 className="font-medium text-sm text-grey-medium uppercase tracking-wide mb-2">{label}</h3>
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <span key={item} className="inline-flex items-center rounded-full text-sm bg-brand-navy/10 text-brand-navy capitalize">
                        <span className="py-1.5 pl-3">{item}</span>
                        <button type="button" onClick={() => onRemove(item)} className="grid place-items-center h-11 w-11 shrink-0 hover:text-status-error-content active:text-status-error-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy" aria-label={t('common.remove', 'Remover')}>
                            <Close style={{ fontSize: 16 }} />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}
