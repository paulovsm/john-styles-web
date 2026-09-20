import React, { useState } from 'react';
import { ExpandLess, ExpandMore, FilterList } from '@mui/icons-material';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import Input from '../common/Input';
import Select from '../common/Select';
import { useTranslation } from 'react-i18next';
import { WARDROBE_CATEGORIES } from '../../utils/garmentTaxonomy';

export default function WardrobeFilters() {
    const { filters, setFilters } = useWardrobeContext();
    const { t } = useTranslation();
    // Four controls stacked on a phone pushed the pieces below the fold, so on
    // small screens they collapse behind a toggle. From md up they are always
    // open and the toggle is not rendered at all.
    const [expanded, setExpanded] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Surfaced on the collapsed toggle so an active filter is never invisible.
    const activeCount = [
        filters.search !== '',
        filters.category !== 'all',
        filters.style !== 'all',
        filters.color !== 'all',
    ].filter(Boolean).length;

    return (
        <div className="bg-white-pure p-3 sm:p-4 rounded-lg shadow-sm border border-grey-light mb-4 sm:mb-6">
            <button
                type="button"
                onClick={() => setExpanded((open) => !open)}
                aria-expanded={expanded}
                aria-controls="wardrobe-filters"
                className="flex min-h-11 w-full items-center justify-between gap-2 text-sm font-semibold text-brand-navy md:hidden"
            >
                <span className="inline-flex items-center gap-2">
                    <FilterList fontSize="small" aria-hidden="true" />
                    {t('wardrobe.filters.toggle')}
                    {activeCount > 0 && (
                        <span className="rounded-full bg-brand-navy px-2 py-0.5 text-xs font-bold text-white-pure">
                            {activeCount}
                        </span>
                    )}
                </span>
                {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </button>

            <div
                id="wardrobe-filters"
                className={`${expanded ? 'mt-3 grid' : 'hidden'} grid-cols-1 gap-4 md:mt-0 md:grid md:grid-cols-4`}
            >
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
