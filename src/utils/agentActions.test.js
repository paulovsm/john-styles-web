import { describe, it, expect } from 'vitest';
import { MAX_LOOK_DESCRIPTION, clampLookDescription, parseAgentActions } from './agentActions';

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
        expect(actions[0].lookDescription.length).toBeLessThanOrEqual(MAX_LOOK_DESCRIPTION);
    });

    it('drops a non-string description instead of seeding it into the prompt', () => {
        const raw = 'ok<actions>[{"type":"tryOn","itemIds":["a"],"lookDescription":42}]</actions>';
        const { actions } = parseAgentActions(raw);
        expect(actions).toEqual([{ type: 'tryOn', itemIds: ['a'] }]);
    });

    // One reply can suggest several looks. Sending the whole reply as one prompt
    // leaves the generator guessing which to render, so each look travels as its
    // own action with its own description.
    it('keeps one action per suggested look', () => {
        const raw = `Três opções para a reunião:
<actions>
[{"type":"tryOn","label":"Provar look 1","lookDescription":"Polo grafite, calça de alfaiataria azul-marinho e mocassim de couro"},
 {"type":"tryOn","itemIds":["w1"],"label":"Provar look 2","lookDescription":"Camiseta modal off-white, blazer de sarja cinza-grafite, chino azul-marinho e mocassim preto"},
 {"type":"tryOn","label":"Provar look 3","lookDescription":"Camiseta preta, calça de alfaiataria grafite, blazer marinho e mocassim preto"}]
</actions>`;
        const { text, actions } = parseAgentActions(raw);

        expect(text).toBe('Três opções para a reunião:');
        expect(actions).toHaveLength(3);
        expect(actions.map((a) => a.label)).toEqual(['Provar look 1', 'Provar look 2', 'Provar look 3']);
        // Each description stands alone — the try-on receives only this text.
        expect(new Set(actions.map((a) => a.lookDescription)).size).toBe(3);
        // A look made only of pieces the user does not own still travels.
        expect(actions[0].itemIds).toEqual([]);
        expect(actions[1].itemIds).toEqual(['w1']);
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

describe('clampLookDescription', () => {
    it('leaves a description that already fits untouched', () => {
        expect(clampLookDescription('  Camisa branca e calça bege.  ')).toBe('Camisa branca e calça bege.');
    });

    // A raw slice ended the real 3112-character reply at "cria uma linha ", so
    // the generator read a fragment as the whole instruction.
    it('cuts at the end of a sentence rather than mid-word', () => {
        const long = `${'Camisa branca com calça bege. '.repeat(100)}cria uma linha contínua`;
        const clamped = clampLookDescription(long);

        expect(clamped.length).toBeLessThanOrEqual(MAX_LOOK_DESCRIPTION);
        expect(clamped.endsWith('.')).toBe(true);
        expect(clamped).not.toMatch(/\s$/);
    });

    it('falls back to a word boundary when there is no sentence end in range', () => {
        const clamped = clampLookDescription('palavra '.repeat(400));

        expect(clamped.length).toBeLessThanOrEqual(MAX_LOOK_DESCRIPTION);
        expect(clamped.endsWith('palavra')).toBe(true);
    });

    it('still cuts hard when the text has no boundary at all', () => {
        expect(clampLookDescription('x'.repeat(MAX_LOOK_DESCRIPTION + 200)))
            .toHaveLength(MAX_LOOK_DESCRIPTION);
    });

    it('handles empty input', () => {
        expect(clampLookDescription('')).toBe('');
        expect(clampLookDescription(undefined)).toBe('');
    });
});
