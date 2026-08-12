import { applyCors } from './_cors.js';
import { clientIp, consumeRateLimit, handleRateLimitError } from './_rateLimit.js';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_CONTACT_EMAIL = 'contato@fleekauthority.com';
const DEFAULT_FROM_EMAIL = 'Fleek Authority <contato@fleekauthority.com>';

export class BusinessContactError extends Error {
    constructor(status, code, message) {
        super(message);
        this.name = 'BusinessContactError';
        this.status = status;
        this.code = code;
    }
}

function sendData(res, data, status = 200) {
    return res.status(status).json({ data });
}

function sendError(res, status, code, message) {
    return res.status(status).json({ error: { code, message } });
}

function stringField(value, name, { required = false, max = 500 } = {}) {
    if (value === undefined || value === null || value === '') {
        if (required) throw new BusinessContactError(400, 'INVALID_INPUT', `${name} is required`);
        return '';
    }
    if (typeof value !== 'string') {
        throw new BusinessContactError(400, 'INVALID_INPUT', `${name} must be a string`);
    }
    const normalized = value.trim();
    if (required && !normalized) {
        throw new BusinessContactError(400, 'INVALID_INPUT', `${name} is required`);
    }
    if (normalized.length > max) {
        throw new BusinessContactError(400, 'INVALID_INPUT', `${name} is too long`);
    }
    return normalized;
}

export function validateBusinessContact(input = {}) {
    const contactType = stringField(input.contactType, 'contactType', { max: 40 }) || 'business';
    const company = stringField(input.company, 'company', { required: contactType !== 'subscription', max: 120 });
    const name = stringField(input.name, 'name', { required: contactType === 'subscription', max: 120 });
    const email = stringField(input.email, 'email', { required: true, max: 180 }).toLowerCase();
    const phone = stringField(input.phone, 'phone', { required: true, max: 40 });
    const projectType = stringField(input.projectType, 'projectType', { max: 80 }) || 'Não informado';
    const message = stringField(input.message, 'message', { max: 1_200 });
    const website = stringField(input.website, 'website', { max: 240 });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new BusinessContactError(400, 'INVALID_INPUT', 'email must be valid');
    }
    if (!/^[0-9+()\s.-]{8,40}$/.test(phone)) {
        throw new BusinessContactError(400, 'INVALID_INPUT', 'phone must be valid');
    }

    if (!['business', 'subscription'].includes(contactType)) {
        throw new BusinessContactError(400, 'INVALID_INPUT', 'contactType must be business or subscription');
    }

    return { contactType, company, name, email, phone, projectType, message, website };
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function buildBusinessEmail(input) {
    const isSubscription = input.contactType === 'subscription';
    const leadLabel = isSubscription ? 'Assinatura Fleek' : 'Fleek para Empresas';
    const identityLabel = isSubscription ? 'Nome' : 'Empresa';
    const identityValue = isSubscription ? input.name : input.company;
    const text = [
        `Nova solicitação — ${leadLabel}`,
        '',
        `${identityLabel}: ${identityValue}`,
        `E-mail: ${input.email}`,
        `Telefone: ${input.phone}`,
        `Tipo de projeto: ${input.projectType}`,
        '',
        'Mensagem:',
        input.message || 'Não informada.',
    ].join('\n');

    const html = `
        <div style="font-family:Arial,sans-serif;color:#171512;line-height:1.6;max-width:640px;margin:auto">
            <p style="font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#6b5b4d">${leadLabel}</p>
            <h1 style="font-size:26px;line-height:1.2">${isSubscription ? 'Novo interesse na assinatura' : 'Nova solicitação de projeto'}</h1>
            <table style="width:100%;border-collapse:collapse;margin:24px 0">
                <tr><td style="padding:10px 0;border-bottom:1px solid #e5e0d9"><strong>${identityLabel}</strong></td><td style="padding:10px 0;border-bottom:1px solid #e5e0d9">${escapeHtml(identityValue)}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e5e0d9"><strong>E-mail</strong></td><td style="padding:10px 0;border-bottom:1px solid #e5e0d9">${escapeHtml(input.email)}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e5e0d9"><strong>Telefone</strong></td><td style="padding:10px 0;border-bottom:1px solid #e5e0d9">${escapeHtml(input.phone)}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e5e0d9"><strong>Projeto</strong></td><td style="padding:10px 0;border-bottom:1px solid #e5e0d9">${escapeHtml(input.projectType)}</td></tr>
            </table>
            <h2 style="font-size:17px">Mensagem</h2>
            <p style="white-space:pre-wrap">${escapeHtml(input.message || 'Não informada.')}</p>
        </div>
    `.trim();

    return { text, html };
}

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS');
        return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
    }

    try {
        const input = validateBusinessContact(req.body);

        // Silently accept automated submissions so bots do not learn that the
        // honeypot caught them, while avoiding rate-limit and email costs.
        if (input.website) return sendData(res, { accepted: true }, 202);

        await consumeRateLimit('businessContact', clientIp(req));

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new BusinessContactError(503, 'EMAIL_NOT_CONFIGURED', 'O canal de contato está temporariamente indisponível.');
        }

        const destination = process.env.CONTACT_EMAIL || DEFAULT_CONTACT_EMAIL;
        const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
        const emailContent = buildBusinessEmail(input);
        const isSubscription = input.contactType === 'subscription';
        const leadIdentity = isSubscription ? input.name : input.company;
        const response = await fetch(RESEND_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                to: [destination],
                reply_to: input.email,
                subject: `[${isSubscription ? 'Assinatura' : 'Empresas'}] Novo contato — ${leadIdentity}`,
                text: emailContent.text,
                html: emailContent.html,
            }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            console.error('business-contact email error:', response.status, result?.message || result?.name || 'Unknown provider error');
            throw new BusinessContactError(502, 'EMAIL_SEND_FAILED', 'Não foi possível enviar sua solicitação agora.');
        }

        return sendData(res, { sent: true, id: result.id || null }, 201);
    } catch (error) {
        if (handleRateLimitError(res, error, sendError)) return;
        if (error instanceof BusinessContactError) {
            return sendError(res, error.status, error.code, error.message);
        }
        console.error('business-contact error:', error);
        return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível enviar sua solicitação agora.');
    }
}
