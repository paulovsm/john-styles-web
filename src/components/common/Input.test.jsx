import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Input from './Input';

describe('Input', () => {
    it('uses theme-aware text, background and placeholder colors', () => {
        render(<Input label="Nome" name="name" value="Calça" onChange={() => {}} placeholder="Nome da peça" />);

        const input = screen.getByLabelText('Nome');
        expect(input).toHaveClass('bg-white-pure', 'text-grey-dark', 'placeholder:text-grey-medium');
    });
});
