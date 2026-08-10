import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { applyCors } from './_cors.js';
import { AuthError, requireAuth } from './_auth.js';
import {
    BlogError,
    handleBlogError,
    isLocalCmsRequest,
    requireAdmin,
    sendData,
    sendError,
} from './_blog.js';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_BASE64_LENGTH = Math.ceil(MAX_IMAGE_BYTES / 3) * 4;
const UPLOAD_DIRECTORY = path.resolve(process.cwd(), 'public', 'blog-uploads');

const IMAGE_EXTENSIONS = new Map([
    ['image/avif', '.avif'],
    ['image/bmp', '.bmp'],
    ['image/gif', '.gif'],
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/tiff', '.tiff'],
    ['image/webp', '.webp'],
]);

function imageExtension(contentType) {
    return IMAGE_EXTENSIONS.get(contentType) || '.img';
}

function safeStem(filename) {
    const leaf = filename.split(/[\\/]/).pop() || '';
    const withoutExtension = leaf.replace(/\.[^.]*$/, '');
    return withoutExtension
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'image';
}

export function validateBlogMediaInput(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new BlogError(400, 'INVALID_INPUT', 'A JSON object is required');
    }

    const { filename, contentType, base64 } = input;
    if (typeof filename !== 'string' || !filename.trim() || filename.length > 255) {
        throw new BlogError(400, 'INVALID_INPUT', 'filename is required and must be at most 255 characters');
    }
    if (typeof contentType !== 'string' || !/^image\/[a-z0-9.+-]+$/i.test(contentType)) {
        throw new BlogError(415, 'UNSUPPORTED_MEDIA_TYPE', 'contentType must be an image type');
    }
    if (typeof base64 !== 'string' || !base64 || base64.length > MAX_BASE64_LENGTH) {
        throw new BlogError(413, 'IMAGE_TOO_LARGE', 'Image must be at most 5 MB');
    }
    if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
        throw new BlogError(400, 'INVALID_INPUT', 'base64 must contain valid base64 data');
    }

    const bytes = Buffer.from(base64, 'base64');
    if (!bytes.length) throw new BlogError(400, 'INVALID_INPUT', 'base64 image data is required');
    if (bytes.length > MAX_IMAGE_BYTES) {
        throw new BlogError(413, 'IMAGE_TOO_LARGE', 'Image must be at most 5 MB');
    }

    const normalizedContentType = contentType.toLowerCase();
    const storedFilename = `${safeStem(filename)}-${randomUUID()}${imageExtension(normalizedContentType)}`;
    return { bytes, contentType: normalizedContentType, storedFilename };
}

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    try {
        if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST, OPTIONS');
            return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed');
        }

        await requireAdmin(req, requireAuth);
        if (!isLocalCmsRequest(req)) {
            throw new BlogError(501, 'REMOTE_MEDIA_UNAVAILABLE', 'Blog media uploads are only available on localhost');
        }

        const { bytes, storedFilename } = validateBlogMediaInput(req.body);
        const target = path.resolve(UPLOAD_DIRECTORY, storedFilename);
        if (path.dirname(target) !== UPLOAD_DIRECTORY) {
            throw new BlogError(400, 'INVALID_INPUT', 'Invalid upload filename');
        }

        await mkdir(UPLOAD_DIRECTORY, { recursive: true });
        await writeFile(target, bytes, { flag: 'wx' });
        return sendData(res, { url: `/blog-uploads/${storedFilename}` }, 201);
    } catch (error) {
        if (handleBlogError(res, error)) return;
        if (error instanceof AuthError) {
            const code = error.status === 401 ? 'UNAUTHORIZED' : 'AUTH_ERROR';
            return sendError(res, error.status, code, error.message);
        }
        console.error('blog-media error:', error);
        return sendError(res, 500, 'INTERNAL_ERROR', 'Unable to upload blog media');
    }
}
