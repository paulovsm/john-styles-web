import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import SubscriptionPage from './SubscriptionPage';
import { submitBusinessContact } from '../services/api/businessContactService';

vi.mock('../services/api/businessContactService', () => ({ submitBusinessContact: vi.fn() }));
vi.mock('../components/common/JohnSignature', () => ({ default: () => <span>John Styles</span> }));

it('keeps the subscription lead form and payload after the visual refresh', async () => {
    submitBusinessContact.mockResolvedValue({});
    const user = userEvent.setup();
    render(<MemoryRouter><SubscriptionPage /></MemoryRouter>);
    await user.type(screen.getByLabelText('Nome'), 'Conta Teste');
    await user.type(screen.getByLabelText('E-mail'), 'test@example.com');
    await user.type(screen.getByLabelText('Telefone'), '11999999999');
    await user.click(screen.getByRole('button', { name: 'Quero conhecer a assinatura' }));
    await waitFor(() => expect(submitBusinessContact).toHaveBeenCalledWith({
        contactType: 'subscription', name: 'Conta Teste', email: 'test@example.com',
        phone: '11999999999', projectType: 'Quero conhecer a assinatura', message: '', website: '',
    }));
    expect(screen.getByRole('status')).toHaveTextContent('Recebemos seu interesse');
});
