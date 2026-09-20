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
