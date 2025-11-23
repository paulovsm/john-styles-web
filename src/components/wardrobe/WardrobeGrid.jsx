import React from 'react';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import WardrobeItemCard from './WardrobeItemCard';
import { Add } from '@mui/icons-material';
import Button from '../common/Button';
import { useTranslation } from 'react-i18next';

export default function WardrobeGrid({ onAddItem, onItemClick }) {
    const { items, removeItem } = useWardrobeContext();
    const { t } = useTranslation();

    if (items.length === 0) {
        return (
            <div className="text-center py-12 bg-white-pure rounded-lg border border-dashed border-grey-light">
                <div className="mx-auto h-12 w-12 text-grey-medium">
                    <Add className="h-full w-full" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-fleek-navy">{t('wardrobe.noItems')}</h3>
                <p className="mt-1 text-sm text-grey-medium">{t('wardrobe.noItemsDescription')}</p>
                <div className="mt-6">
                    <Button onClick={onAddItem}>
                        <Add className="mr-2 h-5 w-5" />
                        {t('wardrobe.addItem')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
                <WardrobeItemCard
                    key={item.id}
                    item={item}
                    onDelete={removeItem}
                    onClick={onItemClick}
                />
            ))}
        </div>
    );
}
