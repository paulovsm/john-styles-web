import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChatInput from './ChatInput';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (_key, fallback) => fallback || _key }),
}));
vi.mock('../../experience/ExperienceContext', () => ({
    useExperience: () => ({ isUniversal: true }),
}));

describe('ChatInput look photo flow', () => {
    beforeEach(() => {
        Object.defineProperty(globalThis.URL, 'createObjectURL', {
            configurable: true,
            value: vi.fn(() => 'blob:look-preview'),
        });
        Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
            configurable: true,
            value: vi.fn(),
        });
    });

    it('previews a valid photo and submits it with the optional request', async () => {
        const user = userEvent.setup();
        const onSend = vi.fn().mockResolvedValue(undefined);
        const onPhotoPromptHandled = vi.fn();
        render(
            <ChatInput
                onSend={onSend}
                requestLookPhoto
                onPhotoPromptHandled={onPhotoPromptHandled}
            />,
        );
        const file = new File(['photo'], 'look.jpg', { type: 'image/jpeg' });

        await user.upload(screen.getByLabelText('Escolher foto'), file);
        await user.type(screen.getByLabelText('Mensagem para o John Styles'), 'É para um jantar.');
        await user.click(screen.getByRole('button', { name: 'Enviar' }));

        expect(onPhotoPromptHandled).toHaveBeenCalledOnce();
        expect(onSend).toHaveBeenCalledWith('É para um jantar.', file);
        await waitFor(() => expect(screen.queryByAltText('Foto do look selecionada')).not.toBeInTheDocument());
    });
});
