import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserProfileContext } from '../contexts/UserProfileContext';
import { geminiService } from '../services/api/geminiService';

export default function OnboardingPage() {
    const { t } = useTranslation();
    const { profile, updateProfile } = useUserProfileContext();
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyzedData, setAnalyzedData] = useState(null);
    const [error, setError] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Load existing profile data on mount
    React.useEffect(() => {
        if (profile.onboardingCompleted && !analyzedData && !isAnalyzing) {
            setAnalyzedData({
                favoriteColors: profile.favoriteColors || [],
                preferredItems: profile.preferredItems || [],
                dislikes: profile.dislikes || [],
                occasions: profile.occasions || [],
                bodyType: profile.bodyType || '',
                favoriteBrands: profile.favoriteBrands || [],
                styleGoals: profile.styleGoals || ''
            });
        }
    }, [profile, analyzedData, isAnalyzing]);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const data = await geminiService.analyzeProfile(text);
            setAnalyzedData(data);
            setIsAnalyzing(false);
        } catch (err) {
            setError(t('onboarding.error'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!analyzedData) return;

        updateProfile({
            ...analyzedData,
            onboardingCompleted: true
        });

        navigate('/dashboard');
    };

    const updateField = (field, value) => {
        setAnalyzedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addTag = (field, tag) => {
        if (!tag.trim()) return;
        setAnalyzedData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), tag.trim()]
        }));
    };

    const removeTag = (field, index) => {
        setAnalyzedData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const TagInput = ({ field, label, items }) => {
        const [input, setInput] = useState('');

        return (
            <div>
                <h3 className="font-bold text-sm text-grey-medium uppercase tracking-wider">{label}</h3>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {items?.map((item, i) => (
                        <span key={i} className="px-2 py-1 bg-white border border-grey-light rounded-full text-sm flex items-center gap-1">
                            {item}
                            <button
                                onClick={() => removeTag(field, i)}
                                className="text-grey-medium hover:text-red-500 ml-1"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag(field, input);
                                setInput('');
                            }
                        }}
                        placeholder={t('onboarding.addTagPlaceholder')}
                        className="flex-1 px-3 py-1 border border-grey-light rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-fleek-navy"
                    />
                    <button
                        onClick={() => {
                            addTag(field, input);
                            setInput('');
                        }}
                        disabled={!input.trim()}
                        className="px-3 py-1 bg-grey-light text-fleek-navy rounded-lg text-sm hover:bg-grey-medium/20 disabled:opacity-50"
                    >
                        +
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white-off flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-serif font-bold text-fleek-navy mb-2">{t('onboarding.title')}</h1>
                <p className="text-grey-medium mb-6">{t('onboarding.subtitle')}</p>

                {isAnalyzing || !analyzedData ? (
                    <div className="space-y-4">
                        <textarea
                            className="w-full h-40 p-4 border border-grey-light rounded-lg focus:outline-none focus:ring-2 focus:ring-fleek-navy resize-none"
                            placeholder={t('onboarding.placeholder')}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={loading}
                        />

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="flex gap-4">
                            {analyzedData && (
                                <button
                                    onClick={() => setIsAnalyzing(false)}
                                    className="flex-1 py-3 border border-fleek-navy text-fleek-navy rounded-lg font-medium hover:bg-fleek-navy/5 transition-colors"
                                >
                                    {t('onboarding.cancelButton')}
                                </button>
                            )}
                            <button
                                onClick={handleAnalyze}
                                disabled={!text.trim() || loading}
                                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${!text.trim() || loading
                                        ? 'bg-grey-light text-grey-medium cursor-not-allowed'
                                        : 'bg-fleek-navy text-white-pure hover:bg-opacity-90'
                                    }`}
                            >
                                {loading ? t('onboarding.analyzing') : t('onboarding.analyzeButton')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-grey-light/20 p-6 rounded-lg space-y-6">
                            <h2 className="text-xl font-serif font-bold text-fleek-navy">{t('onboarding.resultsTitle')}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TagInput
                                    field="favoriteColors"
                                    label={t('onboarding.favoriteColors')}
                                    items={analyzedData.favoriteColors}
                                />

                                <TagInput
                                    field="preferredItems"
                                    label={t('onboarding.preferredItems')}
                                    items={analyzedData.preferredItems}
                                />

                                <TagInput
                                    field="occasions"
                                    label={t('onboarding.occasions')}
                                    items={analyzedData.occasions}
                                />

                                <TagInput
                                    field="dislikes"
                                    label={t('onboarding.dislikes')}
                                    items={analyzedData.dislikes}
                                />

                                <div>
                                    <h3 className="font-bold text-sm text-grey-medium uppercase tracking-wider">{t('onboarding.bodyType')}</h3>
                                    <input
                                        type="text"
                                        value={analyzedData.bodyType || ''}
                                        onChange={(e) => updateField('bodyType', e.target.value)}
                                        className="w-full mt-2 px-3 py-2 border border-grey-light rounded-lg focus:outline-none focus:ring-1 focus:ring-fleek-navy"
                                        placeholder={t('onboarding.unspecified')}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <TagInput
                                        field="favoriteBrands"
                                        label={t('onboarding.favoriteBrands')}
                                        items={analyzedData.favoriteBrands}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <h3 className="font-bold text-sm text-grey-medium uppercase tracking-wider">{t('onboarding.styleGoals')}</h3>
                                    <textarea
                                        value={analyzedData.styleGoals || ''}
                                        onChange={(e) => updateField('styleGoals', e.target.value)}
                                        className="w-full mt-2 px-3 py-2 border border-grey-light rounded-lg focus:outline-none focus:ring-1 focus:ring-fleek-navy resize-none h-24"
                                        placeholder={t('onboarding.noneSpecified')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsAnalyzing(true)}
                                className="flex-1 py-3 border border-fleek-navy text-fleek-navy rounded-lg font-medium hover:bg-fleek-navy/5 transition-colors"
                            >
                                {t('onboarding.reanalyzeButton')}
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 bg-fleek-navy text-white-pure rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                            >
                                {t('onboarding.saveButton')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
