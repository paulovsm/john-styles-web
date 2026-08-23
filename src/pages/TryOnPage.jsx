import React, { useState, useRef } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Card from '../components/common/Card';
import UsageCounter from '../components/common/UsageCounter';
import { useLocation } from 'react-router-dom';
import { useWardrobeContext } from '../contexts/WardrobeContext';
import { geminiService } from '../services/api/geminiService';
import { CloudUpload, AutoAwesome, Check, IosShare } from '@mui/icons-material';
import { shareOrDownloadImage } from '../utils/shareImage';
import { useTranslation } from 'react-i18next';
import { firestoreService } from '../services/storage/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfileContext } from '../contexts/UserProfileContext';
import { useToast } from '../contexts/ToastContext';
import { compressImage, getWardrobeThumbnailUrl, toCompressedDataUrl } from '../utils/imageUtils';
import { garmentsConflict } from '../utils/garmentTaxonomy';



export default function TryOnPage() {
    const { items } = useWardrobeContext();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { profile, updateProfile } = useUserProfileContext();
    const toast = useToast();
    const { t } = useTranslation();
    const [userPhotoPreview, setUserPhotoPreview] = useState('');
    const [savingPhoto, setSavingPhoto] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [generatedImage, setGeneratedImage] = useState('');
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [retryAfter, setRetryAfter] = useState(null);
    const [advancedMode, setAdvancedMode] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [usageRefresh, setUsageRefresh] = useState(0);
    const [outfits, setOutfits] = useState([]);
    const [savingOutfit, setSavingOutfit] = useState(false);
    const [sharing, setSharing] = useState(false);
    const resultRef = useRef(null);

    const handleShare = async () => {
        if (!generatedImage) return;
        setSharing(true);
        try {
            const result = await shareOrDownloadImage(generatedImage);
            if (result === 'downloaded') toast.success(t('tryOn.downloaded', 'Imagem baixada.'));
        } catch (error) {
            console.error('Share failed', error);
            toast.error(t('tryOn.shareError', 'Não foi possível compartilhar a imagem.'));
        } finally {
            setSharing(false);
        }
    };

    // Preload the user's saved model photo so they don't re-upload each session.
    React.useEffect(() => {
        if (profile?.modelPhotoUrl && !userPhotoPreview) {
            // The profile photo arrives asynchronously and seeds the user's editable local preview once.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUserPhotoPreview(profile.modelPhotoUrl);
        }
    }, [profile?.modelPhotoUrl]); // eslint-disable-line react-hooks/exhaustive-deps

    // Preselect items when arriving from the dashboard "outfit of the day".
    const preselectIds = location.state?.preselect;
    React.useEffect(() => {
        if (!preselectIds?.length || items.length === 0) return;
        const resolved = preselectIds.map((id) => items.find((i) => i.id === id)).filter(Boolean);
        if (resolved.length) {
            // Route state intentionally initializes an editable selection after wardrobe data resolves.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedItems(resolved);
        }
        // Run once when we arrive with a preselection.
    }, [preselectIds]); // eslint-disable-line react-hooks/exhaustive-deps

    const persistModelPhoto = async (blob) => {
        if (!currentUser) return;
        setSavingPhoto(true);
        try {
            const url = await firestoreService.uploadModelPhoto(blob);
            updateProfile({ modelPhotoUrl: url });
            toast.success(t('tryOn.photoSaved', 'Foto salva no seu perfil.'));
        } catch (error) {
            console.error('Error saving model photo:', error);
            // Non-fatal: the user can still generate with the local preview.
        } finally {
            setSavingPhoto(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        let usable = file;
        try {
            usable = await compressImage(file);
        } catch (error) {
            console.error('Error compressing image:', error);
        }
        const reader = new FileReader();
        reader.onloadend = () => setUserPhotoPreview(reader.result);
        reader.readAsDataURL(usable);
        // Persist as the reusable model photo (async, non-blocking).
        persistModelPhoto(usable);
    };

    const handleItemClick = (item) => {
        setSelectedItems(prevItems => {
            const isSelected = prevItems.find(i => i.id === item.id);

            if (isSelected) {
                // Deselect if already selected
                return prevItems.filter(i => i.id !== item.id);
            } else {
                // Replace anything that occupies one of the same outfit slots.
                // Composite sets may conflict with more than one broad category.
                const otherItems = prevItems.filter(i => !garmentsConflict(i, item));
                return [...otherItems, item];
            }
        });
    };

    // ── Saved outfits (reusable item combinations) ──
    React.useEffect(() => {
        if (!currentUser) return;
        firestoreService.getOutfits(currentUser.uid).then((list) => {
            if (list) setOutfits(list);
        });
    }, [currentUser]);

    const handleSaveOutfit = async () => {
        if (selectedItems.length === 0 || !currentUser) return;
        setSavingOutfit(true);
        try {
            const name = selectedItems.map((i) => i.name).join(' + ');
            const outfit = { name, itemIds: selectedItems.map((i) => i.id) };
            const id = await firestoreService.saveOutfit(outfit);
            setOutfits((prev) => [{ id, ...outfit }, ...prev]);
            toast.success(t('tryOn.outfitSaved', 'Look salvo.'));
        } catch (error) {
            console.error('Error saving outfit:', error);
            toast.error(t('tryOn.outfitSaveError', 'Falha ao salvar o look.'));
        } finally {
            setSavingOutfit(false);
        }
    };

    const applyOutfit = (outfit) => {
        // Select the items from this outfit that still exist in the wardrobe.
        const resolved = outfit.itemIds
            .map((id) => items.find((it) => it.id === id))
            .filter(Boolean);
        setSelectedItems(resolved);
        if (resolved.length < outfit.itemIds.length) {
            toast.info(t('tryOn.outfitPartial', 'Algumas peças deste look não estão mais no guarda-roupa.'));
        }
    };

    const handleDeleteOutfit = async (outfit) => {
        try {
            await firestoreService.deleteOutfit(outfit.id, currentUser.uid);
            setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
        } catch (error) {
            console.error('Error deleting outfit:', error);
            toast.error(t('tryOn.outfitSaveError', 'Falha ao salvar o look.'));
        }
    };

    const replacePlaceholders = (prompt, items) => {
        // Simple join for multiple items for now, or just use the first one if the prompt expects single item fields
        // Ideally prompt should be constructed dynamically
        const itemNames = items.map(i => i.name).join(', ');
        const itemDescriptions = items.map(i => i.description).join('; ');

        return prompt
            .replace(/{item\.name}/g, itemNames || '')
            .replace(/{item\.description}/g, itemDescriptions || '')
            // Fallback for singular placeholders - use first item
            .replace(/{item\.color}/g, items[0]?.colors?.[0] || '')
            .replace(/{item\.category}/g, items[0]?.category || '')
            .replace(/{item\.style}/g, items[0]?.styles?.[0] || '');
    };

    const handleSaveToGallery = async () => {
        if (!generatedImage || !currentUser) return;

        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Convert generated image (URL or Base64) to Blob
            let imageBlob;
            if (generatedImage.startsWith('data:')) {
                const res = await fetch(generatedImage);
                imageBlob = await res.blob();
            } else {
                // If it's a URL, we might need to proxy it or fetch it if CORS allows
                // For now assuming it's fetchable
                const res = await fetch(generatedImage);
                imageBlob = await res.blob();
            }

            // Upload to Storage
            const storageUrl = await firestoreService.uploadGalleryImage(imageBlob);

            // Save metadata to Firestore
            await firestoreService.saveGalleryItem({
                imageUrl: storageUrl,
                itemsUsed: selectedItems.map(i => i.id),
                prompt: advancedMode ? customPrompt : 'Default prompt',
                originalPhoto: userPhotoPreview // Optional: save original photo URL if we uploaded it too
            });

            setSuccessMessage(t('tryOn.saveSuccess'));
            setSaved(true);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
                setSaved(false);
            }, 3000);

        } catch (error) {
            console.error('Error saving to gallery:', error);
            setErrorMessage(t('tryOn.errors.saveFailed') || 'Failed to save to gallery');
        } finally {
            setSaving(false);
        }
    };

    const handleGenerate = async () => {
        if (!userPhotoPreview || selectedItems.length === 0) return;

        setGenerating(true);
        setErrorMessage('');
        setRetryAfter(null);

        // On mobile the result panel stacks BELOW the (long) input column, so a
        // tap on Generate looks like nothing happened. Bring the result — with
        // its loading state — into view.
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        }

        try {
            let prompt;

            if (advancedMode && customPrompt.trim()) {
                // Use custom prompt with placeholders replaced
                prompt = replacePlaceholders(customPrompt, selectedItems);
            } else {
                // Construct prompt for multiple items
                const itemsDescription = selectedItems.map(item => {
                    const itemCategory = item.category || '';
                    const itemName = item.name || '';
                    return `${itemCategory} (${itemName})`;
                }).join(', ');

                prompt = `Keep this person's appearance exactly as shown in the image. Dress person with the following items: ${itemsDescription}. Replace the current outfit if needed. Maintain photorealistic quality, natural lighting, and the original photo composition. The clothing items should fit naturally on the person.`;
            }

            // Convert to inline base64 for the API, RE-COMPRESSED so the combined
            // payload (photo + items) stays under the serverless body limit.
            const itemImages = await Promise.all(
                selectedItems.map(item => toCompressedDataUrl(item.image))
            );
            const userImageData = await toCompressedDataUrl(userPhotoPreview);
            const imageUrl = await geminiService.generateImage(prompt, userImageData, itemImages);
            setGeneratedImage(imageUrl);
            setUsageRefresh((n) => n + 1); // refresh the remaining-usage counter
        } catch (error) {
            console.error("Try-on generation failed", error);

            // Daily per-user limit reached (enforced server-side).
            if (error.code === 'LIMIT_REACHED') {
                setErrorMessage(t('tryOn.errors.limitReached'));
            }
            // Upstream Gemini quota (temporary, retry after a delay).
            else if (error.code === 'QUOTA_EXCEEDED') {
                const waitTime = error.retryAfter || 60;
                setRetryAfter(waitTime);
                setErrorMessage(t('tryOn.errors.quotaExceeded', { seconds: waitTime }));

                // Auto-clear error after wait time
                setTimeout(() => {
                    setErrorMessage('');
                    setRetryAfter(null);
                }, waitTime * 1000);
            }
            // Network-level failure (fetch rejected) — clearer than "Failed to fetch".
            else if (error.name === 'TypeError' || /failed to fetch/i.test(error.message || '')) {
                setErrorMessage(t('tryOn.errors.network', 'Falha de conexão ao gerar o look. Verifique sua internet e tente novamente.'));
            }
            // Generic error
            else {
                setErrorMessage(error.message || t('tryOn.errors.genericError'));
            }
        } finally {
            setGenerating(false);
        }
    };

    return (
        <MainLayout>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy mb-6">{t('tryOn.title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Inputs */}
                <div className="space-y-6">
                    {/* Step 1: Upload User Photo */}
                    <Card>
                        <Card.Body>
                            <Card.Title as="h2" className="mb-4">{t('tryOn.uploadPhoto')}</Card.Title>
                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-grey-light border-dashed rounded-md relative">
                                {userPhotoPreview ? (
                                    <div className="relative">
                                        <img src={userPhotoPreview} alt={t('tryOn.uploadPhoto')} className="mx-auto h-64 object-cover rounded-md" />
                                        {savingPhoto && (
                                            <span className="absolute bottom-1 left-1 text-[10px] bg-brand-navy/80 text-white-pure px-2 py-0.5 rounded-full">
                                                {t('common.saving', 'Salvando...')}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => { setUserPhotoPreview(''); updateProfile({ modelPhotoUrl: null }); }}
                                            aria-label={t('common.remove', 'Remover')}
                                            className="absolute top-0 right-0 -mt-2 -mr-2 grid h-11 w-11 place-items-center bg-white-pure rounded-full shadow-md text-grey-medium hover:text-status-error-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                                        >
                                            <span className="sr-only">{t('common.remove', 'Remover')}</span>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <label htmlFor="user-photo-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                        <div className="space-y-1 text-center">
                                            <CloudUpload className="mx-auto h-12 w-12 text-grey-medium" />
                                            <div className="flex text-sm text-grey-medium justify-center">
                                                <span className="relative bg-white-pure rounded-md font-medium text-brand-navy hover:text-brand-navy focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-navy">
                                                    <span>{t('wardrobe.addModal.uploadImage')}</span>
                                                    <input id="user-photo-upload" name="user-photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                                                </span>
                                            </div>
                                            <p className="text-xs text-grey-medium">{t('tryOn.uploadPhotoDescription')}</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Step 2: Select Items */}
                    <Card>
                        <Card.Body>
                            <Card.Title as="h2" className="mb-4">{t('tryOn.selectItem')}</Card.Title>
                            {items.length === 0 ? (
                                <p className="text-sm text-grey-medium">{t('tryOn.noItemsWardrobe')}</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                                    {items.map((item) => {
                                        const isSelected = selectedItems.some(i => i.id === item.id);
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                aria-pressed={isSelected}
                                                onClick={() => handleItemClick(item)}
                                                className={`block w-full text-left cursor-pointer border-2 rounded-md overflow-hidden relative ${isSelected ? 'border-brand-navy ring-2 ring-brand-navy ring-opacity-50' : 'border-transparent'
                                                    }`}
                                            >
                                                <img src={getWardrobeThumbnailUrl(item)} alt={item.name} loading="lazy" className="w-full h-24 object-cover" />
                                                <p className="break-words p-1 text-center text-xs lg:truncate">{item.name}</p>
                                                {isSelected && (
                                                    <div className="absolute top-1 right-1 bg-brand-navy text-white-pure rounded-full p-0.5">
                                                        <Check style={{ fontSize: 12 }} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {selectedItems.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-grey-light">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-brand-navy">{t('tryOn.selectedItems', 'Peças selecionadas:')}</p>
                                        <Button variant="text" className="text-xs py-1" onClick={handleSaveOutfit} disabled={savingOutfit}>
                                            {savingOutfit ? <Loading type="spinner" size={14} className="mr-1" /> : null}
                                            {t('tryOn.saveOutfit', 'Salvar look')}
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItems.map(item => (
                                            <span key={item.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-navy/10 text-brand-navy">
                                                {item.category}: {item.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {outfits.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-grey-light">
                                    <p className="text-sm font-medium text-brand-navy mb-2">{t('tryOn.myOutfits', 'Meus looks')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {outfits.map((outfit) => (
                                            <span key={outfit.id} className="inline-flex items-center rounded-full text-xs font-medium bg-brand-gold/15 text-brand-gold-dark">
                                                <button type="button" onClick={() => applyOutfit(outfit)} className="min-h-11 max-w-[160px] break-words rounded-md py-1.5 pl-3 pr-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy lg:truncate" title={outfit.name}>
                                                    {outfit.name}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteOutfit(outfit)}
                                                    aria-label={t('common.delete', 'Excluir')}
                                                    className="grid place-items-center h-11 w-11 shrink-0 hover:text-status-error-content active:text-status-error-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Step 3: Advanced Mode */}
                    <Card>
                        <Card.Body>
                            <div className="flex items-center justify-between mb-4">
                                <Card.Title as="h2" className="mb-0">{t('tryOn.advancedMode')}</Card.Title>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={advancedMode}
                                        onChange={(e) => setAdvancedMode(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-grey-light peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-navy/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white-pure after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white-pure after:border-grey-light after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-navy"></div>
                                </label>
                            </div>
                            {advancedMode && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-grey-dark">
                                        {t('tryOn.customPrompt')}
                                    </label>
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        placeholder={t('tryOn.customPromptPlaceholder')}
                                        className="theme-control w-full px-3 py-2 border border-control-border rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:border-brand-navy sm:text-sm min-h-[100px]"
                                    />
                                    <p className="text-xs text-grey-medium">
                                        {t('tryOn.customPromptHelp')}
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Error/Success Message Display */}
                    {(errorMessage || successMessage) && (
                        <div className={`px-4 py-3 rounded-md mb-4 ${errorMessage
                            ? 'bg-status-error/10 border border-status-error text-status-error-content'
                            : 'bg-status-success/10 border border-status-success text-status-success-content'
                            }`}>
                            <p className="text-sm font-medium">{errorMessage || successMessage}</p>
                            {retryAfter && (
                                <p className="text-xs mt-1">
                                    {t('tryOn.errors.retryIn', { seconds: retryAfter })}
                                </p>
                            )}
                        </div>
                    )}

                    <Button
                        variant="primary"
                        className="w-full py-3"
                        disabled={!userPhotoPreview || selectedItems.length === 0 || generating || !!retryAfter}
                        onClick={handleGenerate}
                    >
                        {generating ? <Loading type="spinner" size={20} className="mr-2" /> : <AutoAwesome className="mr-2" />}
                        {t('tryOn.generate')}
                    </Button>
                    <UsageCounter limitType="lookGeneration" refreshKey={usageRefresh} className="text-center" />
                </div>

                {/* Right Column: Result — the hero moment */}
                <div ref={resultRef} className="lg:sticky lg:top-6 h-fit scroll-mt-4">
                    {generating ? (
                        <div className="rounded-2xl border border-grey-light bg-white-off flex items-center justify-center min-h-[280px] sm:min-h-[500px]">
                            <div className="text-center px-6">
                                <Loading type="spinner" size={48} className="mb-4" />
                                <p className="text-brand-navy font-medium">{t('tryOn.generating')}</p>
                                <p className="text-sm text-grey-medium mt-2">{t('tryOn.generatingDescription')}</p>
                            </div>
                        </div>
                    ) : generatedImage ? (
                        <div className="animate-reveal">
                            <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl">
                                <img
                                    src={generatedImage}
                                    alt={t('tryOn.yourLook')}
                                    className="w-full max-h-[72vh] object-contain"
                                />
                                <div className="absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-black/50 text-[#fff] backdrop-blur-sm">
                                    <AutoAwesome style={{ fontSize: 14 }} />
                                    {t('tryOn.yourLook')}
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap justify-center gap-3">
                                <Button variant="outline" onClick={() => setGeneratedImage('')}>
                                    {t('tryOn.tryAnother')}
                                </Button>
                                <Button variant="outline" onClick={handleShare} disabled={sharing}>
                                    {sharing ? <Loading type="spinner" size={18} className="mr-2" /> : <IosShare className="mr-2 h-5 w-5" />}
                                    {t('tryOn.share', 'Compartilhar')}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSaveToGallery}
                                    disabled={saving || saved}
                                    className={saved ? "bg-status-success border-status-success hover:bg-status-success" : ""}
                                >
                                    {saving ? <Loading type="spinner" size={20} className="mr-2" /> : saved ? <Check className="mr-2" /> : <CloudUpload className="mr-2" />}
                                    {saved ? t('common.saved', 'Salvo!') : t('tryOn.saveGallery')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-grey-light bg-white-off flex items-center justify-center min-h-[240px] sm:min-h-[500px]">
                            <div className="text-center text-grey-medium px-6">
                                <AutoAwesome className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <p>{t('tryOn.placeholder')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
