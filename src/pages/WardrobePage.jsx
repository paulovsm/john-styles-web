import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import WardrobeGrid from '../components/wardrobe/WardrobeGrid';
import WardrobeFilters from '../components/wardrobe/WardrobeFilters';
import AddItemModal from '../components/wardrobe/AddItemModal';
import WardrobeTutorial from '../components/wardrobe/WardrobeTutorial';
import { useWardrobeContext } from '../contexts/WardrobeContext';
import Button from '../components/common/Button';
import { Add, HelpOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function WardrobePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showTutorial, setShowTutorial] = useState(() => {
        try {
            return localStorage.getItem('john-styles.wardrobe-tutorial-dismissed') !== 'true';
        } catch {
            return true;
        }
    });
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

    const openNewItem = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const dismissTutorial = () => {
        setShowTutorial(false);
        try {
            localStorage.setItem('john-styles.wardrobe-tutorial-dismissed', 'true');
        } catch {
            // The tutorial can still be reopened during this session.
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy">{t('wardrobe.title')}</h1>
                <div className="flex flex-wrap justify-end gap-2">
                    {!showTutorial && (
                        <Button variant="text" className="px-3 sm:px-5" onClick={() => setShowTutorial(true)}>
                            <HelpOutline className="mr-2 h-5 w-5" />
                            {t('wardrobe.tutorial.reopen')}
                        </Button>
                    )}
                    <Button className="px-3 sm:px-5" onClick={openNewItem}>
                        <Add className="mr-2 h-5 w-5" />
                        {t('wardrobe.addItem')}
                    </Button>
                </div>
            </div>

            {showTutorial && (
                <WardrobeTutorial onAddItem={openNewItem} onDismiss={dismissTutorial} />
            )}

            {hasDemoItems && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-md bg-brand-gold/10 border border-brand-gold/30 text-sm text-brand-gold-dark">
                    <span>{t('wardrobe.sampleNotice', 'Seu guarda-roupa inclui peças de exemplo para você testar.')}</span>
                    <button onClick={removeSampleItems} className="min-h-[44px] font-medium underline whitespace-nowrap hover:opacity-80 active:opacity-70">
                        {t('wardrobe.removeSamples', 'Remover exemplos')}
                    </button>
                </div>
            )}

            <WardrobeFilters />
            <WardrobeGrid onAddItem={openNewItem} onItemClick={handleItemClick} />

            <AddItemModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveItem}
                item={editingItem}
            />
        </MainLayout>
    );
}
