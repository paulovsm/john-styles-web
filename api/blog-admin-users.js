import { applyCors } from './_cors.js';
import { AuthError, requireAuth } from './_auth.js';
import { getAdminAuth, getAdminDb } from './_firebaseAdmin.js';
import {
    BlogError,
    handleBlogError,
    requireAdmin,
    sendData,
    sendError,
} from './_blog.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function serializeAdminUser(user) {
    return {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        emailVerified: user.emailVerified === true,
        disabled: user.disabled === true,
        admin: user.customClaims?.admin === true,
        providers: (user.providerData || []).map((provider) => provider.providerId).filter(Boolean),
        createdAt: user.metadata?.creationTime || null,
        lastSignInAt: user.metadata?.lastSignInTime || null,
    };
}

export function validateAdminAccessInput(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new BlogError(400, 'INVALID_INPUT', 'A JSON object is required');
    }
    const allowed = new Set(['uid', 'email', 'admin']);
    const unknown = Object.keys(input).filter((key) => !allowed.has(key));
    if (unknown.length) throw new BlogError(400, 'INVALID_INPUT', `Unknown fields: ${unknown.join(', ')}`);
    if (typeof input.admin !== 'boolean') throw new BlogError(400, 'INVALID_INPUT', 'admin must be a boolean');

    const uid = typeof input.uid === 'string' ? input.uid.trim() : '';
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    if ((uid && email) || (!uid && !email)) {
        throw new BlogError(400, 'INVALID_INPUT', 'Use either uid or email');
    }
    if (uid && !/^[A-Za-z0-9_-]{1,200}$/.test(uid)) throw new BlogError(400, 'INVALID_INPUT', 'uid is invalid');
    if (email && !EMAIL_RE.test(email)) throw new BlogError(400, 'INVALID_INPUT', 'email is invalid');
    return { uid: uid || null, email: email || null, admin: input.admin };
}

export function assertAdminCanBeRevoked({ targetIsAdmin, adminCount }) {
    if (targetIsAdmin && adminCount <= 1) {
        throw new BlogError(409, 'LAST_ADMIN', 'The last blog administrator cannot be removed');
    }
}

async function listAllUsers(auth) {
    const users = [];
    let pageToken;
    do {
        const page = await auth.listUsers(1000, pageToken);
        users.push(...page.users);
        pageToken = page.pageToken;
    } while (pageToken);
    return users;
}

async function findTarget(auth, input) {
    try {
        return input.email ? await auth.getUserByEmail(input.email) : await auth.getUser(input.uid);
    } catch (error) {
        if (error?.code === 'auth/user-not-found') {
            throw new BlogError(404, 'USER_NOT_FOUND', 'User not found. Ask them to sign in with Google once before granting access.');
        }
        throw error;
    }
}

async function writeAudit({ actorUid, target, admin }) {
    try {
        const ref = getAdminDb().collection('blogAdminAudit').doc();
        await ref.create({
            actorUid,
            targetUid: target.uid,
            targetEmail: target.email || null,
            action: admin ? 'admin_granted' : 'admin_revoked',
            createdAt: new Date(),
        });
    } catch (error) {
        console.error('blog admin audit error:', error);
    }
}

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        if (req.method === 'GET') return await listAdmins(req, res);
        if (req.method === 'PUT') return await updateAdmin(req, res);
        res.setHeader('Allow', 'GET, PUT, OPTIONS');
        return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
    } catch (error) {
        if (handleBlogError(res, error)) return;
        if (error instanceof AuthError) {
            const code = error.status === 401 ? 'UNAUTHORIZED' : 'AUTH_ERROR';
            return sendError(res, error.status, code, error.message);
        }
        console.error('blog-admin-users error:', error);
        return sendError(res, 500, 'INTERNAL_ERROR', 'Unable to manage blog administrators');
    }
}

async function listAdmins(req, res) {
    const actor = await requireAdmin(req, requireAuth);
    const auth = getAdminAuth();
    const users = await listAllUsers(auth);
    const admins = users
        .filter((user) => user.customClaims?.admin === true)
        .map(serializeAdminUser)
        .sort((a, b) => (a.email || '').localeCompare(b.email || ''));
    return sendData(res, { users: admins, actorUid: actor.uid, count: admins.length });
}

async function updateAdmin(req, res) {
    const actor = await requireAdmin(req, requireAuth);
    const input = validateAdminAccessInput(req.body);
    const auth = getAdminAuth();
    const target = await findTarget(auth, input);

    if (!input.admin && target.customClaims?.admin === true) {
        const users = await listAllUsers(auth);
        const adminCount = users.filter((user) => user.customClaims?.admin === true).length;
        assertAdminCanBeRevoked({ targetIsAdmin: true, adminCount });
    }

    const claims = { ...(target.customClaims || {}) };
    if (input.admin) claims.admin = true;
    else delete claims.admin;
    await auth.setCustomUserClaims(target.uid, claims);
    await writeAudit({ actorUid: actor.uid, target, admin: input.admin });

    const updated = await auth.getUser(target.uid);
    return sendData(res, { user: serializeAdminUser(updated), tokenRefreshRequired: true });
}
