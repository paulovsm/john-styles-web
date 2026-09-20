import { describe, it, expect } from 'vitest';
import { MAX_LOOK_DESCRIPTION, parseAgentActions } from './agentActions';

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

    it('drops invalid actions (bad type, nothing to try on)', () => {
        const raw = 'x<actions>[{"type":"tryOn","itemIds":[]},{"type":"boom"},{"foo":1}]</actions>';
        const { actions } = parseAgentActions(raw);
        expect(actions).toEqual([]);
    });

    // A look John describes can name pieces the wardrobe does not have, and
    // those have no id to send — the description is the only way they reach the
    // generator. So a tryOn with a description but no ids is valid.
    it('accepts a described look with no wardrobe pieces', () => {
        const raw = 'Sugestão:<actions>[{"type":"tryOn","itemIds":[],"lookDescription":"camisa branca e calça bege"}]</actions>';
        const { actions } = parseAgentActions(raw);
        expect(actions).toEqual([
            { type: 'tryOn', itemIds: [], lookDescription: 'camisa branca e calça bege' },
        ]);
    });

    it('keeps ids and description together and trims the description', () => {
        const raw = 'ok<actions>[{"type":"tryOn","itemIds":["a"],"lookDescription":"  com mocassim  "}]</actions>';
        const { actions } = parseAgentActions(raw);
        expect(actions[0]).toEqual({ type: 'tryOn', itemIds: ['a'], lookDescription: 'com mocassim' });
    });

    it('caps a runaway description so the seeded prompt stays bounded', () => {
        const raw = `ok<actions>[{"type":"tryOn","itemIds":["a"],"lookDescription":"${'x'.repeat(MAX_LOOK_DESCRIPTION + 500)}"}]</actions>`;
        const { actions } = parseAgentActions(raw);
        expect(actions[0].lookDescription).toHaveLength(MAX_LOOK_DESCRIPTION);
    });

    it('drops a non-string description instead of seeding it into the prompt', () => {
        const raw = 'ok<actions>[{"type":"tryOn","itemIds":["a"],"lookDescription":42}]</actions>';
        const { actions } = parseAgentActions(raw);
        expect(actions).toEqual([{ type: 'tryOn', itemIds: ['a'] }]);
    });

    it('ignores a malformed actions block but keeps the text', () => {
        const raw = 'Texto útil\n<actions>{not json}</actions>';
        const { text, actions } = parseAgentActions(raw);
        expect(text).toBe('Texto útil');
        expect(actions).toEqual([]);
    });

    it('strips a code-fence the LLM may wrap the block in', () => {
        const raw = 'Aqui vai:\n```\n<actions>[{"type":"navigate","to":"/gallery"}]</actions>\n```';
        const { text, actions } = parseAgentActions(raw);
        expect(text).toBe('Aqui vai:');
        expect(actions).toEqual([{ type: 'navigate', to: '/gallery' }]);
    });

    it('handles non-string input safely', () => {
        expect(parseAgentActions(null)).toEqual({ text: '', actions: [] });
    });
});
