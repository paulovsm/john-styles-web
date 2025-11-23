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
    const { addItem, updateItem } = useWardrobeContext();
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
                <h1 className="text-2xl font-serif font-bold text-fleek-navy">{t('wardrobe.title')}</h1>
                <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                    <Add className="mr-2 h-5 w-5" />
                    {t('wardrobe.addItem')}
                </Button>
            </div>

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
