import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import * as schema from './db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { db } from './db/index.js';
import { auth } from './auth.js';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Security Headers Middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// Configure Allowed Origins for CORS
const configuredOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

const defaultAllowedOrigins = [
    'https://kodingin.com',
    'https://www.kodingin.com',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:4000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
    ...configuredOrigins
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        try {
            const url = new URL(origin);
            const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
            const isVercelPreview = url.hostname.endsWith('.vercel.app');
            const isKodinginDomain = url.hostname === 'kodingin.com' || url.hostname.endsWith('.kodingin.com');
            const isConfigured = defaultAllowedOrigins.includes(origin);

            if (isLocal || isVercelPreview || isKodinginDomain || isConfigured) {
                return callback(null, origin);
            }
            return callback(new Error(`Origin ${origin} not allowed by CORS`));
        } catch {
            return callback(new Error('Invalid Origin header'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'Accept', 'x-seed-secret']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Upload directory & Multer with strict validation
const uploadDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.png';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${safeExt}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max file size
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG images are allowed.'));
        }
    }
});

app.use('/uploads', express.static(uploadDir));

// Mount Better Auth endpoints
app.use('/api/auth', toNodeHandler(auth));

// Authentication Middleware for Protected API routes
export const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });
        if (!session || !session.user) {
            return res.status(401).json({ error: 'Unauthorized: Authentication required' });
        }
        (req as any).user = session.user;
        (req as any).session = session.session;
        next();
    } catch (err: any) {
        console.error('Session authentication error:', err);
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
    }
};

// Initialize Redis client only if REDIS_URL is set
const redis = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, enableOfflineQueue: false }) 
    : null;

if (redis) {
    redis.on('error', (err: any) => {
        console.warn('⚠️ Redis error:', err.message);
    });
}

// Cache helper functions
const getCached = async (key: string) => {
    if (!redis) return null;
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

const setCache = async (key: string, data: any, ttlSeconds = 60 * 5) => {
    if (!redis) return;
    try {
        await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch {}
};

const delCache = async (key: string) => {
    if (!redis) return;
    try {
        await redis.del(key);
    } catch {}
};

// --- ENDPOINTS ---

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Kodingin API Server Running' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Guarded Seed Endpoint: Requires ADMIN_SEED_SECRET or authorized session
app.get('/api/seed', async (req, res) => {
    try {
        const providedSecret = req.headers['x-seed-secret'] || req.query.secret;
        const expectedSecret = process.env.ADMIN_SEED_SECRET;

        // Check if caller provides valid seed secret or has valid admin session
        let isAuthorized = false;
        if (expectedSecret && providedSecret === expectedSecret) {
            isAuthorized = true;
        } else {
            try {
                const session = await auth.api.getSession({
                    headers: fromNodeHeaders(req.headers)
                });
                if (session && session.user) {
                    isAuthorized = true;
                }
            } catch {}
        }

        if (!isAuthorized && process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Forbidden: Seed endpoint requires valid authorization secret.' });
        }

        // Ensure tables exist with exact casing
        await db.execute(`
            CREATE TABLE IF NOT EXISTS "user" (
                "id" TEXT PRIMARY KEY,
                "name" TEXT NOT NULL,
                "email" TEXT NOT NULL UNIQUE,
                "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
                "image" TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS "session" (
                "id" TEXT PRIMARY KEY,
                "expiresAt" TIMESTAMP NOT NULL,
                "token" TEXT NOT NULL UNIQUE,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "ipAddress" TEXT,
                "userAgent" TEXT,
                "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS "account" (
                "id" TEXT PRIMARY KEY,
                "accountId" TEXT NOT NULL,
                "providerId" TEXT NOT NULL,
                "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
                "accessToken" TEXT,
                "refreshToken" TEXT,
                "idToken" TEXT,
                "accessTokenExpiresAt" TIMESTAMP,
                "refreshTokenExpiresAt" TIMESTAMP,
                "scope" TEXT,
                "password" TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS "verification" (
                "id" TEXT PRIMARY KEY,
                "identifier" TEXT NOT NULL,
                "value" TEXT NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP,
                "updatedAt" TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                content TEXT NOT NULL,
                image_url TEXT,
                category_id INTEGER REFERENCES categories(id),
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

        let userResult = { note: "Schema verified successfully" };
        const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "ophrynt@gmail.com";
        const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "kodinginmawon";

        try {
            await auth.api.signUpEmail({
                body: {
                    email: adminEmail,
                    password: adminPassword,
                    name: "Admin"
                }
            });
            userResult = { note: "Admin user created successfully" };
        } catch (authErr: any) {
            userResult = { note: "Admin user already exists or initial registration skipped" };
        }

        res.json({ status: "success", seeded: true, userResult });
    } catch (err: any) {
        console.error("Seed endpoint error:", err);
        res.status(500).json({ error: "Seed failed" });
    }
});

// File upload (Authenticated only)
app.post('/api/upload', requireAuth, (req, res) => {
    upload.single('file')(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ error: err.message || 'Failed to upload file' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    });
});

// Public GET categories
app.get('/api/categories', async (req, res) => {
    try {
        const cacheKey = 'categories:all';
        let data = await getCached(cacheKey);

        if (!data) {
            data = await db.query.categories.findMany();
            await setCache(cacheKey, data);
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Authenticated POST categories
app.post('/api/categories', requireAuth, async (req, res) => {
    try {
        const { name, slug } = req.body;
        if (!name || typeof name !== 'string' || !slug || typeof slug !== 'string') {
            return res.status(400).json({ error: 'Valid category name and slug are required' });
        }

        const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
        const newCategory = await db.insert(schema.categories).values({ 
            name: name.trim(), 
            slug: cleanSlug 
        }).returning();

        await delCache('categories:all');
        res.status(201).json(newCategory[0]);
    } catch (error: any) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Public GET posts
app.get('/api/posts', async (req, res) => {
    try {
        const categoryId = req.query.category as string;
        const cacheKey = categoryId ? `posts:category:${categoryId}` : 'posts:all';

        let data = await getCached(cacheKey);

        if (!data) {
            let postsList;
            if (categoryId && !isNaN(parseInt(categoryId, 10))) {
                postsList = await db.select().from(schema.posts)
                    .where(eq(schema.posts.categoryId, parseInt(categoryId, 10)))
                    .orderBy(desc(schema.posts.createdAt));
            } else {
                postsList = await db.select().from(schema.posts)
                    .orderBy(desc(schema.posts.createdAt));
            }

            data = postsList;
            await setCache(cacheKey, data);
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Authenticated POST posts
app.post('/api/posts', requireAuth, async (req, res) => {
    try {
        const { title, slug, content, categoryId, imageUrl, createdAt } = req.body;

        if (!title || !slug || !content || categoryId === undefined) {
            return res.status(400).json({ error: 'Missing required fields (title, slug, content, categoryId)' });
        }

        const catId = parseInt(categoryId, 10);
        if (isNaN(catId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

        const newPost = await db.insert(schema.posts).values({
            title: title.trim(),
            slug: cleanSlug,
            content,
            imageUrl: imageUrl || null,
            categoryId: catId,
            ...(createdAt && { createdAt: new Date(createdAt) })
        }).returning();

        await delCache('posts:all');
        await delCache(`posts:category:${catId}`);

        res.status(201).json(newPost[0]);
    } catch (error: any) {
        console.error("Create Post error:", error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Authenticated PUT posts
app.put('/api/posts/:id', requireAuth, async (req, res) => {
    try {
        const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const postId = parseInt(rawId, 10);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const { title, slug, content, categoryId, imageUrl, createdAt } = req.body;
        const catId = categoryId ? parseInt(categoryId, 10) : undefined;
        const cleanSlug = slug ? slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') : undefined;

        const updateData: any = {};
        if (title !== undefined) updateData.title = title.trim();
        if (cleanSlug !== undefined) updateData.slug = cleanSlug;
        if (content !== undefined) updateData.content = content;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
        if (catId !== undefined && !isNaN(catId)) updateData.categoryId = catId;
        if (createdAt) updateData.createdAt = new Date(createdAt);

        const updatedPost = await db.update(schema.posts)
            .set(updateData)
            .where(eq(schema.posts.id, postId))
            .returning();

        if (!updatedPost || updatedPost.length === 0) {
            return res.status(404).json({ error: `Post with ID ${postId} not found` });
        }

        await delCache('posts:all');
        if (cleanSlug) await delCache(`post:slug:${cleanSlug}`);
        if (catId) await delCache(`posts:category:${catId}`);

        res.json(updatedPost[0]);
    } catch (error: any) {
        console.error("Edit Post error:", error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Authenticated DELETE posts
app.delete('/api/posts/:id', requireAuth, async (req, res) => {
    try {
        const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const postId = parseInt(rawId, 10);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const deletedPost = await db.delete(schema.posts).where(eq(schema.posts.id, postId)).returning();

        if (deletedPost.length > 0) {
            await delCache('posts:all');
            await delCache(`post:slug:${deletedPost[0].slug}`);
            await delCache(`posts:category:${deletedPost[0].categoryId}`);
            return res.json({ message: 'Deleted successfully' });
        } else {
            return res.status(404).json({ error: 'Post not found for deletion' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Public GET post by slug
app.get('/api/posts/:slug', async (req, res) => {
    try {
        const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
        const slug = String(rawSlug || '');
        const cacheKey = `post:slug:${slug}`;

        let data = await getCached(cacheKey);

        if (!data) {
            const postArray = await db.select().from(schema.posts).where(eq(schema.posts.slug, slug));
            data = postArray.length > 0 ? postArray[0] : null;

            if (data) {
                await setCache(cacheKey, data);
            }
        }

        if (!data) return res.status(404).json({ error: 'Post not found' });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(Number(port), '0.0.0.0', () => {
        console.log(`Backend server running on 0.0.0.0:${port}`);
    });
}

export default app;
