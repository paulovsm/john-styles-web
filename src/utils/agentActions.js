/**
 * The assistant ("John") can append machine-readable actions to its reply so the
 * frontend can offer the user one-click follow-ups (try on a suggested look,
 * jump to the wardrobe, etc.). Actions are USER-INITIATED (rendered as buttons),
 * never auto-executed, and validated against a small whitelist.
 *
 * Contract (n8n agent appends, optional): a fenced block at the end of the reply
 *
 *   <actions>
 *   [ { "type": "tryOn", "itemIds": ["id1","id2"], "label": "Provar este look",
 *       "lookDescription": "camisa branca com calça de alfaiataria bege e mocassim" },
 *     { "type": "navigate", "to": "/wardrobe", "label": "Abrir guarda-roupa" } ]
 *   </actions>
 *
 * `lookDescription` is optional and describes the look in full — including the
 * pieces that are NOT in the wardrobe, which have no id to send. The try-on
 * seeds its advanced prompt with it, so those pieces still reach the generator.
 * A tryOn action is therefore useful with itemIds, with a description, or both.
 */

const ALLOWED_ROUTES = new Set(['/wardrobe', '/gallery', '/try-on', '/dashboard', '/history']);

/** Keeps a seeded prompt from growing unbounded if the agent sends an essay. */
export const MAX_LOOK_DESCRIPTION = 2000;

function isValidAction(a) {
    if (!a || typeof a !== 'object') return false;
    if (a.type === 'tryOn') {
        const hasItems = Array.isArray(a.itemIds) && a.itemIds.length > 0;
        const hasDescription = typeof a.lookDescription === 'string' && a.lookDescription.trim().length > 0;
        return hasItems || hasDescription;
    }
    if (a.type === 'navigate') return typeof a.to === 'string' && ALLOWED_ROUTES.has(a.to);
    return false;
}

function normalizeAction(a) {
    if (a.type !== 'tryOn') return a;
    const description = typeof a.lookDescription === 'string'
        ? a.lookDescription.trim().slice(0, MAX_LOOK_DESCRIPTION)
        : '';
    // Drop the raw field rather than spreading it: anything non-string would
    // survive and end up seeded into the prompt textarea as-is.
    const { lookDescription, ...rest } = a;
    return {
        ...rest,
        itemIds: Array.isArray(a.itemIds) ? a.itemIds : [],
        ...(description ? { lookDescription: description } : {}),
    };
}

/**
 * Splits an agent reply into display text + validated actions.
 * @param {string} text
 * @returns {{ text: string, actions: Array }}
 */
export function parseAgentActions(text) {
    if (typeof text !== 'string') return { text: '', actions: [] };

    const match = text.match(/<actions>([\s\S]*?)<\/actions>/i);
    if (!match) return { text: text.trim(), actions: [] };

    let actions = [];
    try {
        const parsed = JSON.parse(match[1].trim());
        if (Array.isArray(parsed)) actions = parsed.filter(isValidAction).map(normalizeAction);
    } catch {
        // Malformed action block — ignore it, keep the conversational text.
    }

    const clean = text
        .replace(match[0], '')
        // Drop a code fence the LLM may have wrapped the block in.
        .replace(/```(?:json)?\s*```/gi, '')
        .replace(/```(?:json)?\s*$/i, '')
        .trim();
    return { text: clean, actions };
}
