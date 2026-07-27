import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import WardrobeGrid from '../components/wardrobe/WardrobeGrid';
import WardrobeFilters from '../components/wardrobe/WardrobeFilters';
import AddItemModal from '../components/wardrobe/AddItemModal';
import { useWardrobeContext } from '../contexts/WardrobeContext';
import Button from '../components/common/Button';
import { Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function WardrobePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { addItem, updateItem, hasDemoItems, removeSampleItems } = useWardrobeContext();
    const { t } = useTranslation();

    const handleSaveItem = (item) => {
        if (editingItem) {
            updateItem(editingItem.id, item);
        } else {
            addItem(item);
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleItemClick = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-serif font-bold text-brand-navy">{t('wardrobe.title')}</h1>
                <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                    <Add className="mr-2 h-5 w-5" />
                    {t('wardrobe.addItem')}
                </Button>
            </div>

            {hasDemoItems && (
                <div className="mb-4 flex items-center justify-between gap-3 px-4 py-2 rounded-md bg-brand-gold/10 border border-brand-gold/30 text-sm text-brand-gold-dark">
                    <span>{t('wardrobe.sampleNotice', 'Seu guarda-roupa inclui peças de exemplo para você testar.')}</span>
                    <button onClick={removeSampleItems} className="font-medium underline whitespace-nowrap hover:opacity-80">
                        {t('wardrobe.removeSamples', 'Remover exemplos')}
                    </button>
                </div>
            )}

            <WardrobeFilters />
            <WardrobeGrid onAddItem={() => { setEditingItem(null); setIsModalOpen(true); }} onItemClick={handleItemClick} />

            <AddItemModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveItem}
                item={editingItem}
            />
        </MainLayout>
    );
}
