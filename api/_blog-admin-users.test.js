import { describe, expect, it, vi } from 'vitest';

vi.mock('./_firebaseAdmin.js', () => ({ getAdminAuth: vi.fn(), getAdminDb: vi.fn() }));
vi.mock('./_cors.js', () => ({ applyCors: () => false }));
vi.mock('./_auth.js', () => ({
    AuthError: class AuthError extends Error {},
    requireAuth: vi.fn(),
}));

import {
    assertAdminCanBeRevoked,
    serializeAdminUser,
    validateAdminAccessInput,
} from './blog-admin-users.js';

describe('blog administrator management', () => {
    it('accepts either an email or uid and normalizes email', () => {
        expect(validateAdminAccessInput({ email: ' VictorAzzi@Gmail.com ', admin: true }))
            .toEqual({ uid: null, email: 'victorazzi@gmail.com', admin: true });
        expect(validateAdminAccessInput({ uid: 'firebase-user_1', admin: false }))
            .toEqual({ uid: 'firebase-user_1', email: null, admin: false });
    });

    it('rejects ambiguous or invalid access changes', () => {
        expect(() => validateAdminAccessInput({ email: 'invalid', admin: true })).toThrow('email is invalid');
        expect(() => validateAdminAccessInput({ uid: 'u1', email: 'a@b.com', admin: true })).toThrow('either uid or email');
        expect(() => validateAdminAccessInput({ uid: 'u1', admin: 'yes' })).toThrow('admin must be a boolean');
    });

    it('protects the last administrator', () => {
        expect(() => assertAdminCanBeRevoked({ targetIsAdmin: true, adminCount: 1 })).toThrow('last blog administrator');
        expect(() => assertAdminCanBeRevoked({ targetIsAdmin: true, adminCount: 2 })).not.toThrow();
    });

    it('serializes only the user fields needed by the CMS', () => {
        const result = serializeAdminUser({
            uid: 'u1', email: 'admin@example.com', displayName: 'Admin', emailVerified: true,
            customClaims: { admin: true, internalSecret: 'hidden' },
            providerData: [{ providerId: 'google.com' }],
            metadata: { creationTime: 'created', lastSignInTime: 'last' },
        });
        expect(result).toMatchObject({ uid: 'u1', email: 'admin@example.com', admin: true, providers: ['google.com'] });
        expect(result).not.toHaveProperty('customClaims');
    });
});
