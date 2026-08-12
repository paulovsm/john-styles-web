import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    getAdminAuth: vi.fn(),
}));

vi.mock('./_firebaseAdmin.js', () => ({
    getAdminAuth: mocks.getAdminAuth,
}));

import { requireAuth } from './_auth.js';

describe('authentication errors', () => {
    beforeEach(() => {
        mocks.getAdminAuth.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('keeps Firebase Admin configuration details out of the client error', async () => {
        const internalError = new Error('private service account configuration');
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        mocks.getAdminAuth.mockImplementation(() => {
            throw internalError;
        });

        await expect(requireAuth({
            headers: { authorization: 'Bearer test-token' },
        })).rejects.toMatchObject({
            name: 'AuthError',
            status: 500,
            message: 'Authentication service unavailable',
        });

        expect(consoleError).toHaveBeenCalledWith(
            'Firebase Admin authentication is unavailable:',
            internalError,
        );
    });
});
