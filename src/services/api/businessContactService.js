export async function submitBusinessContact(input) {
    const response = await fetch('/api/business-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(
            payload.error?.message
            || payload.message
            || 'Não foi possível enviar sua solicitação agora.'
        );
    }

    return payload.data;
}
