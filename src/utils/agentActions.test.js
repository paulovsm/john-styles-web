import { describe, it, expect } from 'vitest';
import { parseAgentActions } from './agentActions';

describe('parseAgentActions', () => {
    it('returns the text unchanged when there is no actions block', () => {
        const { text, actions } = parseAgentActions('Olá! Como posso ajudar?');
        expect(text).toBe('Olá! Como posso ajudar?');
        expect(actions).toEqual([]);
    });

    it('extracts valid actions and strips the block from the text', () => {
        const raw = 'Que tal este look?\n<actions>[{"type":"tryOn","itemIds":["a","b"],"label":"Provar"}]</actions>';
        const { text, actions } = parseAgentActions(raw);
        expect(text).toBe('Que tal este look?');
        expect(actions).toEqual([{ type: 'tryOn', itemIds: ['a', 'b'], label: 'Provar' }]);
    });

    it('validates navigate routes against the whitelist', () => {
        const raw = 'ok<actions>[{"type":"navigate","to":"/wardrobe"},{"type":"navigate","to":"/evil"}]</actions>';
        const { actions } = parseAgentActions(raw);
        expect(actions).toEqual([{ type: 'navigate', to: '/wardrobe' }]);
    });

    it('drops invalid actions (bad type, empty itemIds)', () => {
        const raw = 'x<actions>[{"type":"tryOn","itemIds":[]},{"type":"boom"},{"foo":1}]</actions>';
        const { actions } = parseAgentActions(raw);
        expect(actions).toEqual([]);
    });

    it('ignores a malformed actions block but keeps the text', () => {
        const raw = 'Texto útil\n<actions>{not json}</actions>';
        const { text, actions } = parseAgentActions(raw);
        expect(text).toBe('Texto útil');
        expect(actions).toEqual([]);
    });

    it('handles non-string input safely', () => {
        expect(parseAgentActions(null)).toEqual({ text: '', actions: [] });
    });
});
