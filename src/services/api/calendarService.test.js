import { afterEach, describe, expect, it, vi } from 'vitest';
import { calendarService } from './calendarService';
import { authFetch } from './authFetch';

vi.mock('./authFetch', () => ({ authFetch: vi.fn() }));

afterEach(() => { vi.clearAllMocks(); window.history.replaceState({}, '', '/'); });

describe('calendar daily context', () => {
    it.each([['/dashboard', 'legacy'], ['/teste-novo-app/dashboard', 'universal']])(
        'asks for the occasion vocabulary of %s', async (path, mode) => {
            window.history.replaceState({}, '', path);
            authFetch.mockResolvedValue({ ok: true, json: async () => ({ connected: false }) });

            await calendarService.today('pt');

            const [url, options] = authFetch.mock.calls[0];
            expect(url).toBe('/api/calendar-today');
            expect(JSON.parse(options.body).experience).toBe(mode);
        },
    );
});
