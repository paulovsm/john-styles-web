import React from 'react';
import { render, screen } from '@testing-library/react';
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

    it('keeps description and category controls readable in dark mode', () => {
        render(<AddItemModal isOpen onClose={() => {}} onSave={() => {}} />);

        expect(screen.getByRole('textbox', { name: 'wardrobe.addModal.description' }))
            .toHaveClass('bg-white-pure', 'text-grey-dark', 'placeholder:text-grey-medium');
        expect(screen.getByRole('combobox', { name: 'wardrobe.addModal.category' }))
            .toHaveClass('wardrobe-filter-select', 'text-grey-dark');
    });
});
