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
import { useExperience } from '../experience/ExperienceContext';
import { useToast } from '../contexts/ToastContext';
import JohnSignature from '../components/common/JohnSignature';

const TUTORIAL_DISMISSED_KEY = 'john-styles.wardrobe-tutorial-dismissed';

export default function WardrobePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tutorialDismissed, setTutorialDismissed] = useState(() => {
        try {
            return localStorage.getItem(TUTORIAL_DISMISSED_KEY) === 'true';
        } catch {
            return false;
        }
    });
    // Set only by the "reopen" button, so the tutorial can be summoned back on a
    // wardrobe that already has pieces.
    const [tutorialReopened, setTutorialReopened] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    // The piece to bring into view after a save, so the user sees what happened.
    const [highlightItemId, setHighlightItemId] = useState(null);
    const { addItem, updateItem, hasDemoItems, removeSampleItems, allItems } = useWardrobeContext();
    const { t } = useTranslation();
    const experience = useExperience();
    const toast = useToast();

    const handleSaveItem = (item) => {
        if (editingItem) {
            updateItem(editingItem.id, item);
        } else {
            addItem(item);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setHighlightItemId(item.id);
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
        setTutorialReopened(false);
        setTutorialDismissed(true);
        try {
            localStorage.setItem(TUTORIAL_DISMISSED_KEY, 'true');
        } catch {
            // The tutorial can still be reopened during this session.
        }
    };

    // On a phone the tutorial is the tallest block above the grid, and it used to
    // greet everyone until dismissed — pushing the pieces themselves off screen.
    // It now opens on its own only when there is nothing else to show. Derived
    // rather than stored, so it disappears as soon as the first piece lands
    // (the wardrobe resolves asynchronously).
    const showTutorial = tutorialReopened || (!tutorialDismissed && allItems.length === 0);

    return (
        <MainLayout>
            {experience.isUniversal && (
                <div className="mb-6 border-l-[3px] border-brand-gold pl-4">
                    <JohnSignature compact className="mb-4" />
                    <h1 className="text-xl font-serif font-bold text-brand-navy sm:text-2xl">
                        {t('experienceV2.wardrobe.title')}
                    </h1>
                    <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-grey-medium sm:block">
                        {t('experienceV2.wardrobe.description')}
                    </p>
                </div>
            )}
            <div className={`flex flex-wrap items-center gap-3 mb-6 ${experience.isUniversal ? 'justify-end' : 'justify-between'}`}>
                {!experience.isUniversal && (
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy">{t('wardrobe.title')}</h1>
                )}
                <div className="flex flex-wrap justify-end gap-2">
                    {!showTutorial && (
                        <Button variant="text" className="px-3 sm:px-5" onClick={() => setTutorialReopened(true)}>
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
            <WardrobeGrid
                onAddItem={openNewItem}
                onItemClick={handleItemClick}
                highlightItemId={highlightItemId}
                onHighlightShown={() => setHighlightItemId(null)}
                onHighlightMissed={() => {
                    setHighlightItemId(null);
                    toast.info(t('wardrobe.savedButFiltered'));
                }}
            />

            <AddItemModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveItem}
                item={editingItem}
            />
        </MainLayout>
    );
}
