import React from 'react';
import Card from '../common/Card';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import { Checkroom } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GARMENT_TYPES_BY_CATEGORY, WARDROBE_CATEGORIES, resolveGarmentType } from '../../utils/garmentTaxonomy';
import InsightsCard from './InsightsCard';

export default function WardrobeSummary() {
    const { allItems = [] } = useWardrobeContext();
    const { t } = useTranslation();

    const counts = allItems.reduce((result, item) => {
        const type = resolveGarmentType(item);
        if (type) result[type] = (result[type] || 0) + 1;
        return result;
    }, {});

    const ownedTypes = WARDROBE_CATEGORIES
        .flatMap((category) => GARMENT_TYPES_BY_CATEGORY[category])
        .filter((type) => counts[type] > 0);

    return (
        <Card className="h-full">
            <Card.Body>
                <div className="flex items-center mb-4">
                    <div className="bg-brand-navy/10 p-2 rounded-full mr-3">
                        <Checkroom className="text-brand-navy" />
                    </div>
                    <Card.Title as="h2" className="whitespace-nowrap">{t('dashboard.wardrobeSummary')}</Card.Title>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                    <div className="min-w-32 rounded-md border border-grey-light bg-white-sunken p-4 text-center">
                        <span className="block text-3xl font-bold text-brand-navy">{allItems.length}</span>
                        <span className="text-xs text-grey-medium uppercase tracking-wide">{t('dashboard.totalItems')}</span>
                    </div>
                    <div className="flex flex-1 flex-wrap content-center gap-2" aria-label={t('dashboard.ownedGarmentTypes')}>
                        {ownedTypes.map((type) => (
                            <span key={type} className="inline-flex min-h-8 items-center gap-2 rounded-full border border-grey-light bg-white-sunken px-3 py-1 text-sm text-grey-dark">
                                <span>{t(`wardrobe.types.${type}`)}</span>
                                <strong className="text-brand-navy">{counts[type]}</strong>
                            </span>
                        ))}
                    </div>
                </div>

                <InsightsCard />
            </Card.Body>
        </Card>
    );
}
