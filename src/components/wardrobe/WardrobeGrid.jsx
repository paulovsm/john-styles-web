import React, { useState } from 'react';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import WardrobeItemCard from './WardrobeItemCard';
import ConfirmDialog from '../common/ConfirmDialog';
import { Add, AutoAwesome } from '@mui/icons-material';
import Button from '../common/Button';
import { useTranslation } from 'react-i18next';

export default function WardrobeGrid({ onAddItem, onItemClick }) {
    const { items, removeItem, addSampleItems } = useWardrobeContext();
    const { t } = useTranslation();
    // Deleting a garment is destructive and irreversible — always confirm.
    const [pendingDelete, setPendingDelete] = useState(null);

    if (items.length === 0) {
        return (
            <div className="text-center py-12 px-4 bg-white-pure rounded-lg border border-dashed border-grey-light">
                <div className="mx-auto h-12 w-12 text-grey-medium">
                    <Add className="h-full w-full" />
                </div>
                <h2 className="mt-2 text-sm font-medium text-brand-navy">{t('wardrobe.noItems')}</h2>
                <p className="mt-1 text-sm text-grey-medium">{t('wardrobe.noItemsDescription')}</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button onClick={onAddItem}>
                        <Add className="mr-2 h-5 w-5" />
                        {t('wardrobe.addItem')}
                    </Button>
                    <Button variant="outline" onClick={addSampleItems}>
                        <AutoAwesome className="mr-2 h-5 w-5" />
                        {t('wardrobe.exploreSamples', 'Explorar com peças de exemplo')}
                    </Button>
                </div>
                <p className="mt-3 text-xs text-grey-medium">
                    {t('wardrobe.exploreSamplesHint', 'Peças de exemplo para testar o app — você pode removê-las quando quiser.')}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {items.map((item) => (
                    <WardrobeItemCard
                        key={item.id}
                        item={item}
                        onDelete={() => setPendingDelete(item)}
                        onClick={onItemClick}
                    />
                ))}
            </div>

            <ConfirmDialog
                isOpen={!!pendingDelete}
                onCancel={() => setPendingDelete(null)}
                onConfirm={() => { removeItem(pendingDelete.id); setPendingDelete(null); }}
                title={t('wardrobe.deleteTitle', 'Excluir peça')}
                message={t('wardrobe.deleteConfirm', 'Tem certeza que deseja excluir esta peça do guarda-roupa?')}
                confirmLabel={t('common.delete', 'Excluir')}
                danger
            />
        </>
    );
}
