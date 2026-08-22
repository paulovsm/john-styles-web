import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AddItemModal from './AddItemModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => ({
            'wardrobe.addModal.title': 'Adicionar item',
            'wardrobe.addModal.itemImage': 'Imagem do item',
            'wardrobe.addModal.takePhoto': 'Tirar foto',
            'wardrobe.addModal.uploadImage': 'Enviar arquivo',
        }[key] || key),
        i18n: { language: 'pt' },
    }),
}));
vi.mock('../../services/api/geminiService', () => ({ geminiService: { analyzeImage: vi.fn() } }));
vi.mock('../../services/storage/firestoreService', () => ({ firestoreService: { uploadImage: vi.fn() } }));
vi.mock('../../utils/imageUtils', () => ({ compressImage: vi.fn() }));
vi.mock('../common/UsageCounter', () => ({ default: () => null }));

describe('AddItemModal photo sources', () => {
    it('offers camera capture and file upload separately', () => {
        render(<AddItemModal isOpen onClose={() => {}} onSave={() => {}} />);

        const cameraInput = screen.getByLabelText('Tirar foto');
        const uploadInput = screen.getByLabelText('Enviar arquivo');
        expect(cameraInput).toHaveAttribute('type', 'file');
        expect(cameraInput).toHaveAttribute('capture', 'environment');
        expect(cameraInput).toHaveAttribute('accept', 'image/*');
        expect(uploadInput).toHaveAttribute('type', 'file');
        expect(uploadInput).not.toHaveAttribute('capture');
    });

    it('keeps description and garment type controls readable in dark mode', () => {
        render(<AddItemModal isOpen onClose={() => {}} onSave={() => {}} />);

        expect(screen.getByRole('textbox', { name: 'wardrobe.addModal.description' }))
            .toHaveClass('bg-white-pure', 'text-grey-dark', 'placeholder:text-grey-medium');
        expect(screen.getByRole('combobox', { name: 'wardrobe.addModal.garmentType' }))
            .toHaveClass('wardrobe-filter-select', 'text-grey-dark');
    });

    it('offers one required type selector with all 48 canonical types', () => {
        render(<AddItemModal isOpen onClose={() => {}} onSave={() => {}} />);

        const select = screen.getByRole('combobox', { name: 'wardrobe.addModal.garmentType' });
        expect(select).toBeRequired();
        expect(screen.getAllByRole('option')).toHaveLength(49);
        expect(screen.getByRole('option', { name: 'wardrobe.types.polo' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'wardrobe.types.dress_shoes' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'wardrobe.types.suit' })).toBeInTheDocument();
    });

    it('loads a legacy subcategory and saves the canonical type and derived category', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();
        const legacyItem = {
            id: 'legacy-polo',
            name: 'Polo azul',
            image: 'https://example.com/polo.jpg',
            category: 'tops',
            subcategory: 'polo',
            colors: ['Azul'],
            styles: ['Casual'],
        };

        render(<AddItemModal isOpen item={legacyItem} onClose={() => {}} onSave={onSave} />);

        expect(screen.getByRole('combobox', { name: 'wardrobe.addModal.garmentType' })).toHaveValue('polo');
        await user.click(screen.getByRole('button', { name: 'wardrobe.addModal.save' }));

        await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
        const saved = onSave.mock.calls[0][0];
        expect(saved).toEqual(expect.objectContaining({
            id: 'legacy-polo',
            type: 'polo',
            category: 'tops',
            taxonomyVersion: 1,
        }));
        expect(saved).not.toHaveProperty('subcategory');
    });
});
