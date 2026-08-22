import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Input from './Input';

describe('Input', () => {
    it('uses theme-aware text, background and placeholder colors', () => {
        render(<Input label="Nome" name="name" value="Calça" onChange={() => {}} placeholder="Nome da peça" />);

        const input = screen.getByLabelText('Nome');
        expect(input).toHaveClass('theme-control', 'border-control-border', 'bg-white-pure', 'text-grey-dark', 'placeholder:text-grey-medium');
    });

    it('connects an error message to the invalid field', () => {
        render(<Input label="Nome" name="name" value="" onChange={() => {}} error="Campo obrigatório" />);

        const input = screen.getByLabelText('Nome');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby', 'name-error');
        expect(screen.getByText('Campo obrigatório')).toHaveAttribute('id', 'name-error');
    });
});
