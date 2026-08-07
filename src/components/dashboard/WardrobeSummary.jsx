import React from 'react';
import Card from '../common/Card';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import { Checkroom } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { mapSubcategory } from '../../utils/categoryMapper';

export default function WardrobeSummary() {
    const { items } = useWardrobeContext();
    const { t } = useTranslation();

    // Resolve a top's sub-type: explicit field first, then infer from its name
    // (so a legacy "Polo preta" counts as a polo, not a camiseta), then default
    // to camiseta (blusa -> camiseta).
    const isTop = (i, sub) => i.category === 'tops'
        && (i.subcategory || mapSubcategory(i.name) || 'tshirt') === sub;

    const stats = {
        total: items.length,
        shirts: items.filter(i => isTop(i, 'shirt')).length,
        polos: items.filter(i => isTop(i, 'polo')).length,
        tshirts: items.filter(i => isTop(i, 'tshirt')).length,
        bottoms: items.filter(i => i.category === 'bottoms').length,
        shoes: items.filter(i => i.category === 'shoes').length,
    };

    return (
        <Card className="h-full">
            <Card.Body>
                <div className="flex items-center mb-4">
                    <div className="bg-brand-navy/10 p-2 rounded-full mr-3">
                        <Checkroom className="text-brand-navy" />
                    </div>
                    <Card.Title>{t('dashboard.wardrobeSummary')}</Card.Title>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white-off p-3 rounded-md text-center">
                        <span className="block text-2xl font-bold text-brand-navy">{stats.total}</span>
                        <span className="text-xs text-grey-medium uppercase tracking-wide">{t('dashboard.totalItems')}</span>
                    </div>
                    <div className="bg-white-off p-3 rounded-md text-center">
                        <span className="block text-2xl font-bold text-brand-navy">{stats.shirts}</span>
                        <span className="text-xs text-grey-medium uppercase tracking-wide">{t('dashboard.shirts', { count: stats.shirts })}</span>
                    </div>
                    <div className="bg-white-off p-3 rounded-md text-center">
                        <span className="block text-2xl font-bold text-brand-navy">{stats.polos}</span>
                        <span className="text-xs text-grey-medium uppercase tracking-wide">{t('dashboard.polos', { count: stats.polos })}</span>
                    </div>
                    <div className="bg-white-off p-3 rounded-md text-center">
                        <span className="block text-2xl font-bold text-brand-navy">{stats.tshirts}</span>
                        <span className="text-xs text-grey-medium uppercase tracking-wide">{t('dashboard.tshirts', { count: stats.tshirts })}</span>
                    </div>
                    <div className="bg-white-off p-3 rounded-md text-center">
                        <span className="block text-2xl font-bold text-brand-navy">{stats.bottoms}</span>
                        <span className="text-xs text-grey-medium uppercase tracking-wide">{t('dashboard.bottoms', { count: stats.bottoms })}</span>
                    </div>
                    <div className="bg-white-off p-3 rounded-md text-center">
                        <span className="block text-2xl font-bold text-brand-navy">{stats.shoes}</span>
                        <span className="text-xs text-grey-medium uppercase tracking-wide">{t('dashboard.shoes', { count: stats.shoes })}</span>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}
