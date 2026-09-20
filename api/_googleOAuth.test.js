import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { signState, verifyState } from './_googleOAuth';

describe('Google OAuth state return path', () => {
    beforeEach(() => {
        process.env.OAUTH_STATE_SECRET = 'test-secret';
    });

    afterEach(() => {
        delete process.env.OAUTH_STATE_SECRET;
    });

    it('preserves the universal pilot dashboard return path', () => {
        expect(verifyState(signState('user-1', '/teste-novo-app/dashboard'))).toEqual({
            uid: 'user-1',
            returnPath: '/teste-novo-app/dashboard',
        });
    });

    it('rejects arbitrary return paths to prevent open redirects', () => {
        expect(verifyState(signState('user-1', 'https://example.com'))).toEqual({
            uid: 'user-1',
            returnPath: '/dashboard',
        });
    });
});
