/**
 * The assistant ("John") can append machine-readable actions to its reply so the
 * frontend can offer the user one-click follow-ups (try on a suggested look,
 * jump to the wardrobe, etc.). Actions are USER-INITIATED (rendered as buttons),
 * never auto-executed, and validated against a small whitelist.
 *
 * Contract (n8n agent appends, optional): a fenced block at the end of the reply
 *
 *   <actions>
 *   [ { "type": "tryOn", "itemIds": ["id1","id2"], "label": "Provar este look" },
 *     { "type": "navigate", "to": "/wardrobe", "label": "Abrir guarda-roupa" } ]
 *   </actions>
 */

const ALLOWED_ROUTES = new Set(['/wardrobe', '/gallery', '/try-on', '/dashboard', '/history']);

function isValidAction(a) {
    if (!a || typeof a !== 'object') return false;
    if (a.type === 'tryOn') return Array.isArray(a.itemIds) && a.itemIds.length > 0;
    if (a.type === 'navigate') return typeof a.to === 'string' && ALLOWED_ROUTES.has(a.to);
    return false;
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
        if (Array.isArray(parsed)) actions = parsed.filter(isValidAction);
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
