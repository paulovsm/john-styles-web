import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ mkdir: vi.fn(), writeFile: vi.fn(), admin: true }));

vi.mock('node:fs/promises', () => ({
    default: { mkdir: mocks.mkdir, writeFile: mocks.writeFile },
    mkdir: mocks.mkdir,
    writeFile: mocks.writeFile,
}));
vi.mock('./_firebaseAdmin.js', () => ({ getAdminDb: vi.fn() }));
vi.mock('./_cors.js', () => ({ applyCors: () => false }));
vi.mock('./_auth.js', () => ({
    AuthError: class AuthError extends Error {
        constructor(status, message) { super(message); this.status = status; }
    },
    requireAuth: async () => ({ uid: 'admin-1', token: { admin: mocks.admin } }),
}));

import handler, { validateBlogMediaInput } from './blog-media.js';

const originalNodeEnv = process.env.NODE_ENV;

function response() {
    return {
        statusCode: 200, body: undefined, headers: {},
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
        setHeader(key, value) { this.headers[key] = value; },
    };
}

async function call({ host = 'localhost:3000', body } = {}) {
    const res = response();
    await handler({ method: 'POST', body, headers: { host } }, res);
    return res;
}

beforeEach(() => {
    process.env.NODE_ENV = 'development';
    mocks.admin = true;
    mocks.mkdir.mockReset();
    mocks.writeFile.mockReset();
});

afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
});

describe('blog media validation', () => {
    it('decodes an image and replaces an unsafe path and extension', () => {
        const result = validateBlogMediaInput({
            filename: '../../Minha Capa.html',
            contentType: 'image/png',
            base64: Buffer.from('png bytes').toString('base64'),
        });
        expect(result.bytes.toString()).toBe('png bytes');
        expect(result.storedFilename).toMatch(/^minha-capa-[a-f0-9-]+\.png$/);
        expect(result.storedFilename).not.toContain('..');
    });

    it('rejects non-images, malformed base64 and payloads over 5 MB', () => {
        expect(() => validateBlogMediaInput({ filename: 'x', contentType: 'text/plain', base64: 'eA==' }))
            .toThrow('contentType must be an image type');
        expect(() => validateBlogMediaInput({ filename: 'x', contentType: 'image/png', base64: 'not base64' }))
            .toThrow('valid base64');
        const oversized = Buffer.alloc((5 * 1024 * 1024) + 1).toString('base64');
        expect(() => validateBlogMediaInput({ filename: 'x', contentType: 'image/png', base64: oversized }))
            .toThrow('at most 5 MB');
    });
});

describe('blog media API', () => {
    it('writes a sanitized image under public/blog-uploads on localhost', async () => {
        const res = await call({
            body: {
                filename: '../Capa Principal.jpg',
                contentType: 'image/jpeg',
                base64: Buffer.from('image').toString('base64'),
            },
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.data.url).toMatch(/^\/blog-uploads\/capa-principal-[a-f0-9-]+\.jpg$/);
        expect(mocks.mkdir).toHaveBeenCalledWith(expect.stringMatching(/[\\/]public[\\/]blog-uploads$/), { recursive: true });
        expect(mocks.writeFile).toHaveBeenCalledWith(
            expect.stringMatching(/[\\/]public[\\/]blog-uploads[\\/]capa-principal-[a-f0-9-]+\.jpg$/),
            expect.any(Buffer),
            { flag: 'wx' },
        );
    });

    it('does not write remotely, even for an authenticated admin', async () => {
        const res = await call({ host: 'cms.example.com', body: {} });
        expect(res.statusCode).toBe(501);
        expect(res.body.error.code).toBe('REMOTE_MEDIA_UNAVAILABLE');
        expect(mocks.writeFile).not.toHaveBeenCalled();
    });

    it('requires a real admin on localhost in production', async () => {
        process.env.NODE_ENV = 'production';
        mocks.admin = false;
        const res = await call({ body: {} });
        expect(res.statusCode).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
        expect(mocks.writeFile).not.toHaveBeenCalled();
    });
});
