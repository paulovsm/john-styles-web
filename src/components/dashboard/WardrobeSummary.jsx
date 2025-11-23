import React from 'react';
import Card from '../common/Card';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import { Checkroom } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function WardrobeSummary() {
    const { items } = useWardrobeContext();
    const { t } = useTranslation();

    const stats = {
        total: items.length,
        tops: items.filter(i => i.category === 'tops').length,
        bottoms: items.filter(i => i.category === 'bottoms').length,
        shoes: items.filter(i => i.category === 'shoes').length,
        accessories: items.filter(i => i.category === 'accessories').length,
    };

    return (
        <Card className="h-full">
            <Card.Body>
                <div className="flex items-center mb-4">
                    <div className="bg-fleek-navy/10 p-2 rounded-full mr-3">
                        <Checkroom className="text-fleek-navy" />
                    </div>
                    <Card.Title>{t('dashboard.wardrobeSummary')}</Card.Title>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white-off p-3 rounded-md text-center">
                        <span className="block text-2xl font-bold text-fleek-navy">{stats.total}</span>
                        <span className="text-xs text-grey-medium uppercase tracking-wide">{t('dashboard.totalItems')}</span>
                    </div>
                    <div className="bg-white-off p-3 rounded-md text-center">
                        <span className="block text-2xl font-bold text-fleek-navy">{stats.tops}</span>
                        <span className="text-xs text-grey-medium uppercase tracking-wide">{t('dashboard.tops')}</span>
                    </div>
                    <div className="bg-white-off p-3 rounded-md text-center">
                        <span className="block text-2xl font-bold text-fleek-navy">{stats.bottoms}</span>
                        <span className="text-xs text-grey-medium uppercase tracking-wide">{t('dashboard.bottoms')}</span>
                    </div>
                    <div className="bg-white-off p-3 rounded-md text-center">
                        <span className="block text-2xl font-bold text-fleek-navy">{stats.shoes}</span>
                        <span className="text-xs text-grey-medium uppercase tracking-wide">{t('dashboard.shoes')}</span>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}
