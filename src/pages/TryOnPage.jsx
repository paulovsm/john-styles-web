import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Card from '../components/common/Card';
import { useWardrobeContext } from '../contexts/WardrobeContext';
import { geminiService } from '../services/api/geminiService';
import { CloudUpload, AutoAwesome, Check } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { firestoreService } from '../services/storage/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { compressImage } from '../utils/imageUtils';

export default function TryOnPage() {
    const { items } = useWardrobeContext();
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [userPhoto, setUserPhoto] = useState(null);
    const [userPhotoPreview, setUserPhotoPreview] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [generatedImage, setGeneratedImage] = useState('');
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [retryAfter, setRetryAfter] = useState(null);
    const [advancedMode, setAdvancedMode] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressedFile = await compressImage(file);
                setUserPhoto(compressedFile);
                const reader = new FileReader();
                reader.onloadend = () => setUserPhotoPreview(reader.result);
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error("Error compressing image:", error);
                // Fallback to original file if compression fails
                setUserPhoto(file);
                const reader = new FileReader();
                reader.onloadend = () => setUserPhotoPreview(reader.result);
                reader.readAsDataURL(file);
            }
        }
    };

    const replacePlaceholders = (prompt, item) => {
        return prompt
            .replace(/{item\.name}/g, item.name || '')
            .replace(/{item\.description}/g, item.description || '')
            .replace(/{item\.color}/g, item.colors?.[0] || '')
            .replace(/{item\.category}/g, item.category || '')
            .replace(/{item\.style}/g, item.styles?.[0] || '');
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
                itemsUsed: [selectedItem.id],
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
        if (!userPhoto || !selectedItem) return;

        setGenerating(true);
        setErrorMessage('');
        setRetryAfter(null);

        try {
            let prompt;

            if (advancedMode && customPrompt.trim()) {
                // Use custom prompt with placeholders replaced
                prompt = replacePlaceholders(customPrompt, selectedItem);
            } else {
                // Use optimized default prompt
                const itemColor = selectedItem.colors?.[0] || '';
                const itemCategory = selectedItem.category || '';
                const itemName = selectedItem.name || '';
                const itemDescription = selectedItem.description || '';

                //prompt = `Keep this person's appearance exactly as shown in the image. Dress person with the ${itemColor} ${itemCategory} (${itemName} - ${itemDescription}), replace the current outfit if needed. Maintain photorealistic quality, natural lighting, and the original photo composition. The clothing item should fit naturally on the person.`;
                prompt = `Keep this person's appearance exactly as shown in the image. Dress person with the ${itemName}. Replace the current outfit if needed. Maintain photorealistic quality, natural lighting, and the original photo composition. The clothing item should fit naturally on the person.`;
            }

            const imageUrl = await geminiService.generateImage(prompt, userPhotoPreview, selectedItem.image);
            setGeneratedImage(imageUrl);
        } catch (error) {
            console.error("Try-on generation failed", error);

            // Handle quota exceeded error
            if (error.code === 'QUOTA_EXCEEDED' || error.status === 429) {
                const waitTime = error.retryAfter || 60;
                setRetryAfter(waitTime);
                setErrorMessage(t('tryOn.errors.quotaExceeded', { seconds: waitTime }));

                // Auto-clear error after wait time
                setTimeout(() => {
                    setErrorMessage('');
                    setRetryAfter(null);
                }, waitTime * 1000);
            } else {
                // Generic error
                setErrorMessage(error.message || t('tryOn.errors.genericError'));
            }
        } finally {
            setGenerating(false);
        }
    };

    return (
        <MainLayout>
            <h1 className="text-2xl font-serif font-bold text-fleek-navy mb-6">{t('tryOn.title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Inputs */}
                <div className="space-y-6">
                    {/* Step 1: Upload User Photo */}
                    <Card>
                        <Card.Body>
                            <Card.Title className="mb-4">{t('tryOn.uploadPhoto')}</Card.Title>
                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-grey-light border-dashed rounded-md relative">
                                {userPhotoPreview ? (
                                    <div className="relative">
                                        <img src={userPhotoPreview} alt="User" className="mx-auto h-64 object-cover rounded-md" />
                                        <button
                                            onClick={() => { setUserPhoto(null); setUserPhotoPreview(''); }}
                                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-white-pure rounded-full p-1 shadow-md text-grey-medium hover:text-status-error"
                                        >
                                            <span className="sr-only">Remove</span>
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
                                                <span className="relative bg-white-pure rounded-md font-medium text-fleek-navy hover:text-fleek-navy focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-fleek-navy">
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

                    {/* Step 2: Select Item */}
                    <Card>
                        <Card.Body>
                            <Card.Title className="mb-4">{t('tryOn.selectItem')}</Card.Title>
                            {items.length === 0 ? (
                                <p className="text-sm text-grey-medium">{t('tryOn.noItemsWardrobe')}</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedItem(item)}
                                            className={`cursor-pointer border-2 rounded-md overflow-hidden ${selectedItem?.id === item.id ? 'border-fleek-navy ring-2 ring-fleek-navy ring-opacity-50' : 'border-transparent'
                                                }`}
                                        >
                                            <img src={item.image} alt={item.name} className="w-full h-24 object-cover" />
                                            <p className="text-xs p-1 truncate text-center">{item.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Step 3: Advanced Mode */}
                    <Card>
                        <Card.Body>
                            <div className="flex items-center justify-between mb-4">
                                <Card.Title className="mb-0">{t('tryOn.advancedMode')}</Card.Title>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={advancedMode}
                                        onChange={(e) => setAdvancedMode(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-grey-light peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-fleek-navy/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white-pure after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white-pure after:border-grey-light after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fleek-navy"></div>
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
                                        className="w-full px-3 py-2 border border-grey-light rounded-md shadow-sm focus:outline-none focus:ring-fleek-navy focus:border-fleek-navy sm:text-sm min-h-[100px]"
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
                            ? 'bg-status-error/10 border border-status-error text-status-error'
                            : 'bg-status-success/10 border border-status-success text-status-success'
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
                        disabled={!userPhoto || !selectedItem || generating || !!retryAfter}
                        onClick={handleGenerate}
                    >
                        {generating ? <Loading type="spinner" size={20} className="mr-2" /> : <AutoAwesome className="mr-2" />}
                        {t('tryOn.generate')}
                    </Button>
                </div>

                {/* Right Column: Result */}
                <div className="bg-white-off rounded-xl border border-grey-light p-6 flex items-center justify-center min-h-[500px]">
                    {generating ? (
                        <div className="text-center">
                            <Loading type="spinner" size={48} className="mb-4" />
                            <p className="text-fleek-navy font-medium">{t('tryOn.generating')}</p>
                            <p className="text-sm text-grey-medium mt-2">{t('tryOn.generatingDescription')}</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="w-full">
                            <h3 className="text-lg font-medium text-fleek-navy mb-4 text-center">{t('tryOn.yourLook')}</h3>
                            <img src={generatedImage} alt="Generated Try-On" className="w-full rounded-lg shadow-lg" />
                            <div className="mt-6 flex justify-center space-x-4">
                                <Button variant="outline" onClick={() => setGeneratedImage('')}>
                                    {t('tryOn.tryAnother')}
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
                        <div className="text-center text-grey-medium">
                            <AutoAwesome className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p>{t('tryOn.placeholder')}</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
