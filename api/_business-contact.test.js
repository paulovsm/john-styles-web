import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ consumeRateLimit: vi.fn() }));

vi.mock('./_cors.js', () => ({ applyCors: () => false }));
vi.mock('./_rateLimit.js', () => ({
    clientIp: () => '127.0.0.1',
    consumeRateLimit: mocks.consumeRateLimit,
    handleRateLimitError: () => false,
}));

import handler, { buildBusinessEmail, validateBusinessContact } from './business-contact.js';

function responseMock() {
    return {
        statusCode: 200,
        body: null,
        headers: {},
        setHeader(name, value) { this.headers[name] = value; },
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

describe('business contact', () => {
    beforeEach(() => {
        mocks.consumeRateLimit.mockResolvedValue({ remaining: 4, limit: 5 });
        process.env.RESEND_API_KEY = 're_test';
        process.env.CONTACT_EMAIL = 'contato@fleekauthority.com';
        process.env.RESEND_FROM_EMAIL = 'Fleek Authority <contato@fleekauthority.com>';
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        delete process.env.RESEND_API_KEY;
        delete process.env.CONTACT_EMAIL;
        delete process.env.RESEND_FROM_EMAIL;
    });

    it('normalizes a valid contact request', () => {
        expect(validateBusinessContact({
            company: '  Empresa Exemplo  ',
            email: 'CONTATO@EXEMPLO.COM',
            phone: ' (11) 99999-9999 ',
            projectType: 'Uniformes para equipe',
            message: '  Precisamos de 40 peças. ',
        })).toEqual({
            contactType: 'business',
            company: 'Empresa Exemplo',
            name: '',
            email: 'contato@exemplo.com',
            phone: '(11) 99999-9999',
            projectType: 'Uniformes para equipe',
            message: 'Precisamos de 40 peças.',
            website: '',
        });
    });

    it('rejects invalid required contact details', () => {
        expect(() => validateBusinessContact({ company: '', email: 'x', phone: '123' }))
            .toThrow('company is required');
        expect(() => validateBusinessContact({ company: 'Fleek', email: 'x', phone: '(11) 99999-9999' }))
            .toThrow('email must be valid');
    });

    it('accepts an individual subscription lead without a company', () => {
        expect(validateBusinessContact({
            contactType: 'subscription',
            name: '  Marina Silva ',
            email: 'marina@example.com',
            phone: '(11) 98888-7777',
            projectType: 'Quero conhecer a assinatura',
        })).toMatchObject({
            contactType: 'subscription',
            name: 'Marina Silva',
            company: '',
        });
    });

    it('escapes user content in the HTML email', () => {
        const email = buildBusinessEmail({
            company: '<script>Empresa</script>',
            email: 'cliente@example.com',
            phone: '(11) 99999-9999',
            projectType: 'Evento',
            message: '<b>Olá</b>',
        });
        expect(email.html).not.toContain('<script>');
        expect(email.html).not.toContain('<b>Olá</b>');
        expect(email.html).toContain('&lt;script&gt;Empresa&lt;/script&gt;');
    });

    it('sends the lead to the configured contact email', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ id: 'email_123' }),
        });
        vi.stubGlobal('fetch', fetchMock);

        const req = {
            method: 'POST',
            headers: {},
            body: {
                company: 'Empresa Exemplo',
                email: 'cliente@example.com',
                phone: '(11) 99999-9999',
                projectType: 'Uniformes para equipe',
                message: 'Precisamos de 40 peças.',
                website: '',
            },
        };
        const res = responseMock();

        await handler(req, res);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ data: { sent: true, id: 'email_123' } });
        expect(mocks.consumeRateLimit).toHaveBeenCalledOnce();
        expect(fetchMock).toHaveBeenCalledWith('https://api.resend.com/emails', expect.objectContaining({ method: 'POST' }));

        const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(payload.to).toEqual(['contato@fleekauthority.com']);
        expect(payload.reply_to).toBe('cliente@example.com');
        expect(payload.subject).toContain('Empresa Exemplo');
    });

    it('silently accepts honeypot submissions without sending email', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        const res = responseMock();

        await handler({
            method: 'POST',
            headers: {},
            body: {
                company: 'Bot',
                email: 'bot@example.com',
                phone: '(11) 99999-9999',
                website: 'https://spam.example',
            },
        }, res);

        expect(res.statusCode).toBe(202);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(mocks.consumeRateLimit).not.toHaveBeenCalled();
    });
});
