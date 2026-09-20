import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MessageItem from './MessageItem';

const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key, fallback) => fallback || key }),
}));
// Markdown rendering is not what these tests are about.
vi.mock('react-markdown', () => ({ default: ({ children }) => <p>{children}</p> }));
vi.mock('remark-gfm', () => ({ default: () => {} }));
vi.mock('../common/Avatar', () => ({ default: () => null }));

const LOOK = 'Para o casamento: camisa branca de algodão, calça de alfaiataria bege, '
    + 'cinto de couro marrom e mocassim. Se quiser fugir do óbvio, troque a camisa por '
    + 'uma de linho gola padre e mantenha o resto — o conjunto continua formal sem ficar duro.';
const SHORT = 'Combina, sim!';

const assistant = (content, actions) => ({ role: 'model', content, actions, timestamp: Date.now() });

describe('MessageItem try-on handoff', () => {
    beforeEach(() => vi.clearAllMocks());

    // Users were copying John's reply into the advanced prompt by hand.
    it('sends a look reply to the advanced prompt in one tap', async () => {
        const user = userEvent.setup();
        render(<MessageItem message={assistant(LOOK)} />);

        await user.click(screen.getByRole('button', { name: 'Provar no modo avançado' }));

        expect(navigate).toHaveBeenCalledWith('/try-on', { state: { lookPrompt: LOOK } });
    });

    // Reported from real use: this reply is long and on-topic, but it asks which
    // direction to take instead of naming a look. Offering the try-on there was
    // noise, and it followed old messages into the thread when history loaded.
    it('stays quiet on a long reply that asks rather than suggests', () => {
        const question = 'Com certeza! Podemos criar sugestões completas e totalmente novas, sem nos '
            + 'limitarmos às peças que você já tem cadastradas no guarda-roupa. Antes de montarmos as '
            + 'opções ideais, preciso apenas de um alinhamento: Linha de vestuário: você prefere foco em '
            + 'moda masculina, moda feminina ou ambas? Ocasião e clima: o foco principal continua sendo o '
            + 'visual Casual Executivo / Business Casual para trabalho em TI?';

        render(<MessageItem message={assistant(question)} />);

        expect(screen.queryByRole('button', { name: 'Provar no modo avançado' })).not.toBeInTheDocument();
    });

    it('stays out of the way on short replies and on the user\'s own messages', () => {
        const { unmount } = render(<MessageItem message={assistant(SHORT)} />);
        expect(screen.queryByRole('button', { name: 'Provar no modo avançado' })).not.toBeInTheDocument();
        unmount();

        render(<MessageItem message={{ role: 'user', content: LOOK, timestamp: Date.now() }} />);
        expect(screen.queryByRole('button', { name: 'Provar no modo avançado' })).not.toBeInTheDocument();
    });

    // The agent's own button already covers the look, so a second, near-identical
    // offer next to it would only add noise.
    it('defers to an explicit tryOn action when the agent sent one', async () => {
        const user = userEvent.setup();
        const action = { type: 'tryOn', itemIds: ['a', 'b'], lookDescription: 'camisa branca e calça bege' };
        render(<MessageItem message={assistant(LOOK, [action])} />);

        expect(screen.queryByRole('button', { name: 'Provar no modo avançado' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Provar este look' }));

        // Both halves travel: the ids for what the wardrobe has, the description
        // for the pieces John named that it does not.
        expect(navigate).toHaveBeenCalledWith('/try-on', {
            state: { preselect: ['a', 'b'], lookPrompt: 'camisa branca e calça bege' },
        });
    });

    it('falls back to the reply text when the action carries no description', async () => {
        const user = userEvent.setup();
        render(<MessageItem message={assistant(LOOK, [{ type: 'tryOn', itemIds: ['a'] }])} />);

        await user.click(screen.getByRole('button', { name: 'Provar este look' }));

        expect(navigate).toHaveBeenCalledWith('/try-on', {
            state: { preselect: ['a'], lookPrompt: LOOK },
        });
    });
});
