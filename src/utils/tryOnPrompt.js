const IDENTITY_INSTRUCTION = "Keep this person's appearance exactly as shown in the image.";
const QUALITY_INSTRUCTION = 'Maintain photorealistic quality, natural lighting, and the original photo composition. The clothing items should fit naturally on the person.';

/**
 * Substitutes the legacy `{item.*}` markers.
 *
 * The markers are no longer advertised in the UI — they read as configuration
 * syntax and the garment photos are sent to the model anyway, so naming an item
 * in text added nothing. This stays so a request seeded from a chat suggestion
 * can never leak a raw `{item.name}` into the generation.
 */
export function replacePlaceholders(prompt, items = []) {
    const names = items.map((item) => item.name).filter(Boolean).join(', ');
    const descriptions = items.map((item) => item.description).filter(Boolean).join('; ');

    return prompt
        .replace(/{item\.name}/g, names)
        .replace(/{item\.description}/g, descriptions)
        .replace(/{item\.color}/g, items[0]?.colors?.[0] || '')
        .replace(/{item\.category}/g, items[0]?.category || '')
        .replace(/{item\.style}/g, items[0]?.styles?.[0] || '');
}

/**
 * Builds the instruction sent to the image model.
 *
 * A custom request is appended to the base instruction instead of replacing it.
 * On its own it carries none of the identity or photorealism constraints, so
 * an ask as small as "make the polo green" could come back with a different
 * face or a painted-looking result.
 */
export function buildTryOnPrompt({ items = [], customRequest = '' } = {}) {
    const trimmed = customRequest.trim();

    const itemsDescription = items
        .map((item) => `${item.category || ''} (${item.name || ''})`)
        .join(', ');

    const dressing = items.length > 0
        ? ` Dress person with the following items: ${itemsDescription}. Replace the current outfit if needed.`
        : '';

    const base = `${IDENTITY_INSTRUCTION}${dressing} ${QUALITY_INSTRUCTION}`;

    return trimmed
        ? `${base} Additional request from the user: ${replacePlaceholders(trimmed, items)}`
        : base;
}
