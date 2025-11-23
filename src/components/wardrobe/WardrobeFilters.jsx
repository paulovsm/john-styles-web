import React from 'react';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import Input from '../common/Input';
import { useTranslation } from 'react-i18next';

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
                />

                <div>
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border-grey-light focus:outline-none focus:ring-fleek-navy focus:border-fleek-navy sm:text-sm rounded-md"
                    >
                        <option value="all">{t('wardrobe.filters.allCategories')}</option>
                        <option value="tops">{t('wardrobe.filters.categories.tops')}</option>
                        <option value="bottoms">{t('wardrobe.filters.categories.bottoms')}</option>
                        <option value="shoes">{t('wardrobe.filters.categories.shoes')}</option>
                        <option value="accessories">{t('wardrobe.filters.categories.accessories')}</option>
                        <option value="outerwear">{t('wardrobe.filters.categories.outerwear')}</option>
                    </select>
                </div>

                <div>
                    <select
                        name="style"
                        value={filters.style}
                        onChange={handleChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border-grey-light focus:outline-none focus:ring-fleek-navy focus:border-fleek-navy sm:text-sm rounded-md"
                    >
                        <option value="all">{t('wardrobe.filters.allStyles')}</option>
                        <option value="casual">{t('wardrobe.filters.styles.casual')}</option>
                        <option value="formal">{t('wardrobe.filters.styles.formal')}</option>
                        <option value="business">{t('wardrobe.filters.styles.business')}</option>
                        <option value="sporty">{t('wardrobe.filters.styles.sporty')}</option>
                        <option value="chic">{t('wardrobe.filters.styles.chic')}</option>
                        <option value="boho">{t('wardrobe.filters.styles.boho')}</option>
                    </select>
                </div>

                <div>
                    <select
                        name="color"
                        value={filters.color}
                        onChange={handleChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border-grey-light focus:outline-none focus:ring-fleek-navy focus:border-fleek-navy sm:text-sm rounded-md"
                    >
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
                    </select>
                </div>
            </div>
        </div>
    );
}
