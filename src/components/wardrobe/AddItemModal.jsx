import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { geminiService } from '../../services/api/geminiService';
import { firestoreService } from '../../services/storage/firestoreService';
import { AutoAwesome, CameraAlt, CloudUpload, LightbulbOutlined } from '@mui/icons-material';
import { compressImage } from '../../utils/imageUtils';
import UsageCounter from '../common/UsageCounter';
import {
    GARMENT_TYPES_BY_CATEGORY,
    TAXONOMY_VERSION,
    WARDROBE_CATEGORIES,
    deriveCategory,
    DEFAULT_STYLE_PREFERENCE,
    typesForPreference,
    GARMENT_TYPE_KEYS,
    normalizeGarmentType,
    resolveGarmentType,
} from '../../utils/garmentTaxonomy';

import { useTranslation } from 'react-i18next';
import { useUserProfileContext } from '../../contexts/UserProfileContext';

export default function AddItemModal({ isOpen, onClose, onSave, item }) {
    const { t, i18n } = useTranslation();
    // Optional on purpose: the modal must still render if it is mounted outside
    // the profile provider. Without a profile we fall back to the neutral register.
    const profile = useUserProfileContext()?.profile;

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [processingPhoto, setProcessingPhoto] = useState(false);
    const [showAllTypes, setShowAllTypes] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Offer the garment types that match the user's styling register, so a
    // menswear user isn't scrolling past dresses. Never a hard restriction:
    // "ver todos" reveals everything, and a type already saved on the item
    // stays selectable even when hidden.
    const preference = profile?.stylePreference || DEFAULT_STYLE_PREFERENCE;
    const allowedTypes = useMemo(() => {
        if (showAllTypes) return null;
        const allowed = typesForPreference(preference);
        // 'both' already covers everything — treat as unfiltered.
        return allowed.length === GARMENT_TYPE_KEYS.length ? null : new Set(allowed);
    }, [preference, showAllTypes]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: '',
        color: '',
        style: '',
        brand: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (item) {
                // Modal form state must be reset from the newly opened item; this is prop-to-draft synchronization.
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFormData({
                    name: item.name || '',
                    description: item.description || '',
                    type: resolveGarmentType(item) || '',
                    color: item.colors ? item.colors[0] : '',
                    style: item.styles ? item.styles[0] : '',
                    brand: item.brand || ''
                });
                setPreview(item.image || '');
                setFile(null);
            } else {
                setFormData({
                    name: '',
                    description: '',
                    type: '',
                    color: '',
                    style: '',
                    brand: ''
                });
                setPreview('');
                setFile(null);
            }
        }
    }, [isOpen, item]);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        e.target.value = '';
        if (!selectedFile) return;
        // Compressing a 12MP phone photo takes 0.5–2s on the main thread; without
        // a flag the dropzone looks unchanged and the user re-taps the camera.
        setProcessingPhoto(true);
        try {
            const compressedFile = await compressImage(selectedFile);
            setFile(compressedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error("Error compressing image:", error);
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } finally {
            setProcessingPhoto(false);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setAnalyzing(true);
        setAnalyzeError('');
        try {
            const analysis = await geminiService.analyzeImage(file, i18n.language);

            const analyzedType = normalizeGarmentType(analysis.type);
            setFormData(prev => ({
                ...prev,
                name: analysis.name || prev.name,
                description: analysis.description || prev.description,
                type: analyzedType || prev.type,
                color: analysis.color || prev.color,
                style: analysis.style || prev.style,
                brand: analysis.brand || prev.brand
            }));
        } catch (error) {
            console.error("Analysis failed", error);
            setAnalyzeError(
                error.code === 'LIMIT_REACHED'
                    ? t('wardrobe.errors.limitReached')
                    : t('wardrobe.errors.analysisFailed', 'Falha ao analisar a imagem. Tente novamente.')
            );
        } finally {
            setAnalyzing(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaveError('');
        setSaving(true);

        try {
            const type = normalizeGarmentType(formData.type);
            const category = deriveCategory(type);
            if (!type || !category) {
                setSaveError(t('wardrobe.errors.typeRequired'));
                return;
            }

            const id = item?.id || Date.now().toString();
            let imageUrl = preview;

            // If a new image was selected (we still hold the File), upload it to
            // Storage and persist only the URL — never the base64 blob, which
            // would bloat the Firestore doc / localStorage.
            if (file) {
                imageUrl = await firestoreService.uploadImage(file, id);
            }

            onSave({
                ...formData,
                id,
                image: imageUrl,
                type,
                category,
                taxonomyVersion: TAXONOMY_VERSION,
                colors: formData.color ? [formData.color] : [],
                styles: formData.style ? [formData.style] : []
            });
            onClose();
        } catch (error) {
            console.error('Error saving item:', error);
            setSaveError(t('wardrobe.errors.saveFailed', 'Falha ao salvar o item. Tente novamente.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? t('wardrobe.addModal.titleEdit') : t('wardrobe.addModal.title')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-grey-dark mb-1">{t('wardrobe.addModal.itemImage')}</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-grey-light border-dashed rounded-md relative hover:bg-grey-lightest transition-colors">
                        {processingPhoto ? (
                            <div className="flex flex-col items-center justify-center h-48 text-grey-medium" role="status">
                                <Loading type="spinner" size={32} className="mb-2" />
                                <p className="text-sm">{t('wardrobe.addModal.processingPhoto', 'Processando foto...')}</p>
                            </div>
                        ) : preview ? (
                            <div className="relative w-full">
                                <img src={preview} alt={t('wardrobe.addModal.previewAlt', 'Prévia da peça selecionada')} className="mx-auto h-48 object-cover rounded-md" style={{ imageOrientation: 'from-image' }} />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(''); }}
                                    aria-label={t('common.remove', 'Remover')}
                                    className="absolute top-0 right-0 -mt-2 -mr-2 grid place-items-center h-11 w-11 bg-white-pure rounded-full shadow-md text-grey-medium hover:text-status-error-content active:text-status-error-content z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="space-y-1 text-center">
                                    <CloudUpload className="mx-auto h-12 w-12 text-grey-medium" />
                                    <p className="text-sm text-grey-dark">{t('wardrobe.addModal.photoPrompt')}</p>
                                    <p className="text-xs text-grey-medium">{t('wardrobe.addModal.fileTypes')}</p>
                                </div>
                                <div className="mt-4 flex w-full flex-col justify-center gap-2 sm:flex-row">
                                    <label htmlFor="camera-capture" className="inline-flex cursor-pointer items-center justify-center rounded-full border border-brand-navy bg-brand-navy px-5 py-2 text-sm font-semibold text-white-pure transition-colors hover:bg-opacity-90 focus-within:ring-2 focus-within:ring-brand-navy focus-within:ring-offset-2">
                                        <CameraAlt className="mr-2" fontSize="small" />
                                        {t('wardrobe.addModal.takePhoto')}
                                        <input
                                            id="camera-capture"
                                            name="camera-capture"
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <label htmlFor="file-upload" className="inline-flex cursor-pointer items-center justify-center rounded-md border border-brand-navy bg-transparent px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-grey-light focus-within:ring-2 focus-within:ring-brand-navy focus-within:ring-offset-2">
                                        <CloudUpload className="mr-2" fontSize="small" />
                                        {t('wardrobe.addModal.uploadImage')}
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                    {!preview && (
                        <div className="mt-2 flex items-start gap-2 rounded-md bg-brand-gold/10 px-3 py-2 text-xs text-grey-dark">
                            <LightbulbOutlined className="mt-0.5 shrink-0 text-brand-gold-dark" fontSize="small" />
                            <span>{t('wardrobe.addModal.photoTip')}</span>
                        </div>
                    )}
                </div>

                {preview && (
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="accent"
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="text-xs"
                        >
                            {analyzing ? <Loading type="spinner" size={16} className="mr-2" /> : <AutoAwesome className="mr-1 h-4 w-4" />}
                            {t('wardrobe.addModal.analyzeAI')}
                        </Button>
                    </div>
                )}

                {preview && (
                    <UsageCounter limitType="wardrobeAnalysis" refreshKey={analyzing ? 0 : 1} className="text-right" />
                )}

                {analyzeError && (
                    <div role="alert" className="px-3 py-2 rounded-md bg-status-error/10 border border-status-error text-status-error-content text-sm">
                        {analyzeError}
                    </div>
                )}

                <Input
                    label={t('wardrobe.addModal.name')}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('wardrobe.addModal.namePlaceholder')}
                    required
                />

                <div>
                    <label htmlFor="item-description" className="block text-sm font-medium text-grey-dark mb-1">{t('wardrobe.addModal.description') || 'Description'}</label>
                    <textarea
                        id="item-description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder={t('wardrobe.addModal.descriptionPlaceholder') || 'Enter a brief description'}
                        className="theme-control block w-full min-h-[80px] rounded-md border border-control-border bg-white-pure px-3 py-2 text-grey-dark shadow-sm placeholder:text-grey-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:border-brand-navy sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="item-type" className="block text-sm font-medium text-grey-dark mb-1">{t('wardrobe.addModal.garmentType')}</label>
                    <select
                        id="item-type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="wardrobe-filter-select block w-full min-h-11 rounded-md border border-control-border bg-white-pure px-3 py-2 text-grey-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:border-brand-navy sm:text-sm"
                    >
                        <option value="">{t('wardrobe.addModal.garmentTypePlaceholder')}</option>
                        {WARDROBE_CATEGORIES.map((category) => {
                            const types = GARMENT_TYPES_BY_CATEGORY[category]
                                .filter((type) => !allowedTypes || allowedTypes.has(type) || type === formData.type);
                            if (types.length === 0) return null;
                            return (
                                <optgroup key={category} label={t(`wardrobe.filters.categories.${category}`)}>
                                    {types.map((type) => (
                                        <option key={type} value={type}>{t(`wardrobe.types.${type}`)}</option>
                                    ))}
                                </optgroup>
                            );
                        })}
                    </select>
                    {allowedTypes && (
                        <button
                            type="button"
                            onClick={() => setShowAllTypes(true)}
                            className="mt-1 text-xs text-grey-medium underline hover:text-brand-navy"
                        >
                            {t('wardrobe.addModal.showAllTypes', 'Ver todos os tipos')}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label={t('wardrobe.addModal.color')}
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder={t('wardrobe.addModal.colorPlaceholder')}
                    />
                    <Input
                        label={t('wardrobe.addModal.style')}
                        name="style"
                        value={formData.style}
                        onChange={handleChange}
                        placeholder={t('wardrobe.addModal.stylePlaceholder')}
                    />
                </div>

                <Input
                    label={t('wardrobe.addModal.brand')}
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder={t('wardrobe.addModal.brandPlaceholder')}
                />

                {saveError && (
                    <div role="alert" className="px-3 py-2 rounded-md bg-status-error/10 border border-status-error text-status-error-content text-sm">
                        {saveError}
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-grey-light">
                    <Button type="button" variant="text" onClick={onClose} disabled={saving}>
                        {t('wardrobe.addModal.cancel')}
                    </Button>
                    <Button type="submit" variant="primary" disabled={!formData.name || !preview || saving}>
                        {saving ? <Loading type="spinner" size={16} className="mr-2" /> : null}
                        {t('wardrobe.addModal.save')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
