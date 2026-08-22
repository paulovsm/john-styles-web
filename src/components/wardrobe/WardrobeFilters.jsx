import React from 'react';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import Input from '../common/Input';
import Select from '../common/Select';
import { useTranslation } from 'react-i18next';
import { WARDROBE_CATEGORIES } from '../../utils/garmentTaxonomy';

export default function WardrobeFilters() {
    const { filters, setFilters } = useWardrobeContext();
    const { t } = useTranslation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white-pure p-4 rounded-lg shadow-sm border border-grey-light mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                    name="search"
                    placeholder={t('wardrobe.filters.search')}
                    value={filters.search}
                    onChange={handleChange}
                    className="md:col-span-1"
                    aria-label={t('wardrobe.filters.search')}
                />

                <Select name="category" value={filters.category} onChange={handleChange} aria-label={t('wardrobe.filters.allCategories')}>
                        <option value="all">{t('wardrobe.filters.allCategories')}</option>
                        {WARDROBE_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {t(`wardrobe.filters.categories.${category}`)}
                            </option>
                        ))}
                </Select>

                <Select name="style" value={filters.style} onChange={handleChange} aria-label={t('wardrobe.filters.allStyles')}>
                        <option value="all">{t('wardrobe.filters.allStyles')}</option>
                        <option value="casual">{t('wardrobe.filters.styles.casual')}</option>
                        <option value="formal">{t('wardrobe.filters.styles.formal')}</option>
                        <option value="business">{t('wardrobe.filters.styles.business')}</option>
                        <option value="sporty">{t('wardrobe.filters.styles.sporty')}</option>
                        <option value="chic">{t('wardrobe.filters.styles.chic')}</option>
                        <option value="boho">{t('wardrobe.filters.styles.boho')}</option>
                </Select>

                <Select name="color" value={filters.color} onChange={handleChange} aria-label={t('wardrobe.filters.allColors')}>
                        <option value="all">{t('wardrobe.filters.allColors')}</option>
                        <option value="black">{t('wardrobe.filters.colors.black')}</option>
                        <option value="white">{t('wardrobe.filters.colors.white')}</option>
                        <option value="blue">{t('wardrobe.filters.colors.blue')}</option>
                        <option value="red">{t('wardrobe.filters.colors.red')}</option>
                        <option value="green">{t('wardrobe.filters.colors.green')}</option>
                        <option value="yellow">{t('wardrobe.filters.colors.yellow')}</option>
                        <option value="pink">{t('wardrobe.filters.colors.pink')}</option>
                        <option value="purple">{t('wardrobe.filters.colors.purple')}</option>
                        <option value="grey">{t('wardrobe.filters.colors.grey')}</option>
                        <option value="brown">{t('wardrobe.filters.colors.brown')}</option>
                        <option value="beige">{t('wardrobe.filters.colors.beige')}</option>
                </Select>
            </div>
        </div>
    );
}
