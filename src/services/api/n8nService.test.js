import { afterEach, describe, expect, it, vi } from 'vitest';
import { n8nService } from './n8nService';
import { authFetch } from './authFetch';

vi.mock('./authFetch', () => ({ authFetch: vi.fn() }));
vi.mock('../../i18n/config', () => ({ default: { language: 'pt', t: (key) => key } }));

afterEach(() => { vi.clearAllMocks(); window.history.replaceState({}, '', '/'); });

describe('chat contract after visual promotion', () => {
    it.each([['/chat', 'legacy'], ['/teste-novo-app/chat', 'universal']])(
        'preserves the service mode at %s', async (path, mode) => {
            window.history.replaceState({}, '', path);
            authFetch.mockResolvedValue({ ok: true, json: async () => ({ content: 'Test response' }) });
            const context = { userProfile: { stylePreference: 'both' }, wardrobeItems: [{ id: 'test' }], chatHistory: [] };
            expect(await n8nService.sendMessage('Test', context)).toBe('Test response');
            const [url, options] = authFetch.mock.calls[0];
            expect(url).toBe('/api/chat');
            expect(JSON.parse(options.body)).toEqual({ message: 'Test', experience: mode, language: 'pt', ...context });
        },
    );
});

const context = { userProfile: {}, wardrobeItems: [], chatHistory: [] };

describe('chat failure modes', () => {
    // A slow agent and an unreachable one used to raise identical errors, so the
    // UI called a 240s timeout a connection problem.
    it('surfaces the timeout code so the caller can say what went wrong', async () => {
        authFetch.mockResolvedValue({
            ok: false,
            status: 504,
            json: async () => ({ error: 'CHAT_TIMEOUT', message: 'The assistant took too long to respond.' }),
        });

        await expect(n8nService.sendMessage('Test', context)).rejects.toMatchObject({
            code: 'CHAT_TIMEOUT',
            status: 504,
        });
    });

    it('still reports a plain failure when the body carries no code', async () => {
        authFetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });

        await expect(n8nService.sendMessage('Test', context)).rejects.toMatchObject({
            code: undefined,
            status: 500,
        });
    });

    it('survives an error response that is not JSON at all', async () => {
        authFetch.mockResolvedValue({
            ok: false,
            status: 502,
            json: async () => { throw new SyntaxError('Unexpected token <'); },
        });

        await expect(n8nService.sendMessage('Test', context)).rejects.toMatchObject({ status: 502 });
    });
});
