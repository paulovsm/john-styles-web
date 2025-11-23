import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { geminiService } from '../../services/api/geminiService';
import { AutoAwesome, CloudUpload } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';

export default function AddItemModal({ isOpen, onClose, onSave, item }) {
    const { t, i18n } = useTranslation();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'tops',
        color: '',
        style: '',
        brand: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (item) {
                setFormData({
                    name: item.name || '',
                    description: item.description || '',
                    category: item.category || 'tops',
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
                    category: 'tops',
                    color: '',
                    style: '',
                    brand: ''
                });
                setPreview('');
                setFile(null);
            }
        }
    }, [isOpen, item]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setAnalyzing(true);
        try {
            const analysis = await geminiService.analyzeImage(file, i18n.language);
            console.log("Gemini Analysis Result:", analysis);

            // Map Gemini response to our internal categories
            let mappedCategory = 'tops'; // Default
            if (analysis.category) {
                const lowerCat = analysis.category.toLowerCase();
                console.log("Gemini Category Raw:", analysis.category);
                console.log("Gemini Category Lower:", lowerCat);

                // Priority: Exact matches from the 5 expected categories
                if (['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'].includes(lowerCat)) {
                    mappedCategory = lowerCat;
                } else {
                    // Fallback heuristic
                    if (lowerCat.includes('shoe') || lowerCat.includes('sneaker') || lowerCat.includes('boot') || lowerCat.includes('sandal') || lowerCat.includes('heel')) {
                        mappedCategory = 'shoes';
                    } else if (lowerCat.includes('pant') || lowerCat.includes('jeans') || lowerCat.includes('short') || lowerCat.includes('trousers') || lowerCat.includes('skirt') || lowerCat.includes('legging')) {
                        mappedCategory = 'bottoms';
                    } else if (lowerCat.includes('access') || lowerCat.includes('hat') || lowerCat.includes('cap') || lowerCat.includes('scarf') || lowerCat.includes('belt') || lowerCat.includes('bag') || lowerCat.includes('glasses')) {
                        mappedCategory = 'accessories';
                    } else if (lowerCat.includes('outer') || lowerCat.includes('coat') || lowerCat.includes('jacket') || lowerCat.includes('blazer') || lowerCat.includes('cardigan')) {
                        mappedCategory = 'outerwear';
                    } else if (lowerCat.includes('top') || lowerCat.includes('shirt') || lowerCat.includes('blouse') || lowerCat.includes('sweater') || lowerCat.includes('hoodie') || lowerCat.includes('vest')) {
                        mappedCategory = 'tops';
                    }
                }
                console.log("Mapped Category:", mappedCategory);
            }

            setFormData(prev => ({
                ...prev,
                name: analysis.name || prev.name,
                description: analysis.description || prev.description,
                category: mappedCategory,
                color: analysis.color || prev.color,
                style: analysis.style || prev.style,
                brand: analysis.brand || prev.brand
            }));
        } catch (error) {
            console.error("Analysis failed", error);
            // Ideally show error notification
        } finally {
            setAnalyzing(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: item ? item.id : undefined,
            image: preview,
            colors: formData.color ? [formData.color] : [], // Simple array conversion
            styles: formData.style ? [formData.style] : []
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? t('wardrobe.addModal.titleEdit') : t('wardrobe.addModal.title')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-grey-dark mb-1">{t('wardrobe.addModal.itemImage')}</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-grey-light border-dashed rounded-md relative hover:bg-grey-lightest transition-colors cursor-pointer">
                        {preview ? (
                            <div className="relative w-full">
                                <img src={preview} alt="Preview" className="mx-auto h-48 object-cover rounded-md" />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(''); }}
                                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-white-pure rounded-full p-1 shadow-md text-grey-medium hover:text-status-error z-10"
                                >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                <div className="space-y-1 text-center">
                                    <CloudUpload className="mx-auto h-12 w-12 text-grey-medium" />
                                    <div className="flex text-sm text-grey-medium justify-center">
                                        <span className="relative bg-white-pure rounded-md font-medium text-fleek-navy hover:text-fleek-navy focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-fleek-navy">
                                            <span>{t('wardrobe.addModal.uploadImage')}</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                        </span>
                                        <p className="pl-1">{t('wardrobe.addModal.dragDrop')}</p>
                                    </div>
                                    <p className="text-xs text-grey-medium">{t('wardrobe.addModal.fileTypes')}</p>
                                </div>
                            </label>
                        )}
                    </div>
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

                <Input
                    label={t('wardrobe.addModal.name')}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('wardrobe.addModal.namePlaceholder')}
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-grey-dark mb-1">{t('wardrobe.addModal.description') || 'Description'}</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder={t('wardrobe.addModal.descriptionPlaceholder') || 'Enter a brief description'}
                        className="block w-full px-3 py-2 border border-grey-light rounded-md shadow-sm focus:outline-none focus:ring-fleek-navy focus:border-fleek-navy sm:text-sm min-h-[80px]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-grey-dark mb-1">{t('wardrobe.addModal.category')}</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-grey-light rounded-md shadow-sm focus:outline-none focus:ring-fleek-navy focus:border-fleek-navy sm:text-sm"
                    >
                        <option value="tops">{t('wardrobe.filters.categories.tops')}</option>
                        <option value="bottoms">{t('wardrobe.filters.categories.bottoms')}</option>
                        <option value="shoes">{t('wardrobe.filters.categories.shoes')}</option>
                        <option value="accessories">{t('wardrobe.filters.categories.accessories')}</option>
                        <option value="outerwear">{t('wardrobe.filters.categories.outerwear')}</option>
                    </select>
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

                <div className="flex justify-end space-x-3 pt-4 border-t border-grey-light">
                    <Button type="button" variant="text" onClick={onClose}>
                        {t('wardrobe.addModal.cancel')}
                    </Button>
                    <Button type="submit" variant="primary" disabled={!formData.name || !preview}>
                        {t('wardrobe.addModal.save')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
