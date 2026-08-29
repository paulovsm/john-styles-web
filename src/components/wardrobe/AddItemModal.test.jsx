import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddItemModal from './AddItemModal';

const storageMocks = vi.hoisted(() => ({
    uploadImage: vi.fn(),
    uploadThumbnail: vi.fn(),
}));
const imageMocks = vi.hoisted(() => ({
    compressImage: vi.fn((file) => Promise.resolve(file)),
    createWardrobeThumbnail: vi.fn(() => Promise.resolve(new File(['thumb'], 'thumb.webp', { type: 'image/webp' }))),
}));

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
// Stubbed for its import graph, not its value: the real module reaches
// firebaseConfig, which calls getAuth() at import time and throws without
// Firebase env vars (CI has none).
vi.mock('../../contexts/UserProfileContext', () => ({ useUserProfileContext: () => ({ profile: {} }) }));
vi.mock('../../services/api/geminiService', () => ({ geminiService: { analyzeImage: vi.fn() } }));
vi.mock('../../services/storage/firestoreService', () => ({ firestoreService: storageMocks }));
vi.mock('../../utils/imageUtils', async (importOriginal) => ({
    ...(await importOriginal()),
    ...imageMocks,
}));
vi.mock('../common/UsageCounter', () => ({ default: () => null }));

describe('AddItemModal photo sources', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        imageMocks.compressImage.mockImplementation((file) => Promise.resolve(file));
        imageMocks.createWardrobeThumbnail.mockResolvedValue(new File(['thumb'], 'thumb.webp', { type: 'image/webp' }));
    });

    it('offers camera capture and file upload separately', () => {
        render(<AddItemModal isOpen onClose={() => {}} onSave={() => {}} />);

        const cameraInput = screen.getByLabelText('Tirar foto');
        const uploadInput = screen.getByLabelText('Enviar arquivo');
        expect(cameraInput).toHaveAttribute('type', 'file');
        expect(cameraInput).toHaveAttribute('capture', 'environment');
        expect(cameraInput.getAttribute('accept')).toContain('image/webp');
        expect(uploadInput).toHaveAttribute('type', 'file');
        expect(uploadInput).not.toHaveAttribute('capture');
    });

    it('rejects unsupported photos before processing or uploading', async () => {
        render(<AddItemModal isOpen onClose={() => {}} onSave={() => {}} />);

        fireEvent.change(screen.getByLabelText('Enviar arquivo'), {
            target: { files: [new File(['heic'], 'photo.heic', { type: 'image/heic' })] },
        });

        expect(screen.getByRole('alert')).toHaveTextContent('wardrobe.errors.unsupportedImageType');
        expect(imageMocks.compressImage).not.toHaveBeenCalled();
        expect(storageMocks.uploadImage).not.toHaveBeenCalled();
    });

    it('uploads and persists the original plus its thumbnail', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();
        storageMocks.uploadImage.mockResolvedValue('https://example.com/original.jpg');
        storageMocks.uploadThumbnail.mockResolvedValue('https://example.com/thumb.webp');
        render(<AddItemModal isOpen onClose={() => {}} onSave={onSave} />);

        await user.upload(
            screen.getByLabelText('Enviar arquivo'),
            new File(['jpeg'], 'photo.jpg', { type: 'image/jpeg' }),
        );
        await screen.findByRole('img', { name: 'wardrobe.addModal.previewAlt' });
        await user.type(screen.getByRole('textbox', { name: 'wardrobe.addModal.name' }), 'Terno azul');
        await user.selectOptions(screen.getByRole('combobox', { name: 'wardrobe.addModal.garmentType' }), 'suit');
        await user.click(screen.getByRole('button', { name: 'wardrobe.addModal.save' }));

        await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
        expect(storageMocks.uploadImage).toHaveBeenCalledTimes(1);
        expect(storageMocks.uploadThumbnail).toHaveBeenCalledTimes(1);
        expect(onSave.mock.calls[0][0]).toEqual(expect.objectContaining({
            image: 'https://example.com/original.jpg',
            thumbnailUrl: 'https://example.com/thumb.webp',
        }));
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
