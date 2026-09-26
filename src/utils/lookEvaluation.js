export function formatLookEvaluation(evaluation, t) {
    const lines = [
        `**${t('lookEvaluation.responseTitle', 'Avaliação do John')}**`,
        '',
        evaluation.verdict || t('lookEvaluation.noVerdict', 'Analisei como as peças funcionam juntas neste look.'),
    ];

    if (evaluation.strengths?.length) {
        lines.push('', `**${t('lookEvaluation.strengths', 'O que funciona bem')}**`);
        evaluation.strengths.forEach((entry) => lines.push(`- ${entry}`));
    }
    if (evaluation.improvements?.length) {
        lines.push('', `**${t('lookEvaluation.improvements', 'O que pode melhorar')}**`);
        evaluation.improvements.forEach((entry) => lines.push(`- ${entry}`));
    }
    if (evaluation.suggestions?.length) {
        lines.push('', `**${t('lookEvaluation.wardrobeSuggestions', 'Trocas possíveis com seu guarda-roupa')}**`);
        evaluation.suggestions.forEach((suggestion) => {
            lines.push(`- **${suggestion.itemName}** — ${suggestion.reason}`);
        });
    }
    return lines.join('\n');
}

export function buildLookSwapPrompt({ replaceTarget, itemName }) {
    return `Edit the first image as a precise fashion wardrobe substitution. Replace ONLY the visible ${replaceTarget || 'garment'} with the exact ${itemName || 'garment'} shown in the second reference image. Preserve the person's identity, face, hair, body, pose and expression. Preserve the background, framing, lighting, image quality, all other garments and every accessory. Match the replacement garment's real color, material, cut, pattern and details from the reference, adapting only its fit and perspective naturally to the person. Produce one photorealistic image with no text, collage, before-and-after split or extra people.`;
}
