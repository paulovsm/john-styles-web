import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
    it('renders its children', () => {
        render(<Button>Salvar</Button>);
        expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Ok</Button>);
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('is disabled and shows a spinner while loading', () => {
        render(<Button isLoading>Enviar</Button>);
        const btn = screen.getByRole('button');
        expect(btn).toBeDisabled();
        expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
    });

    it('does not fire onClick when disabled', async () => {
        const onClick = vi.fn();
        render(<Button disabled onClick={onClick}>X</Button>);
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).not.toHaveBeenCalled();
    });
});
