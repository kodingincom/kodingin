import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import * as schema from './db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { db } from './db/index.js';
import { auth } from './auth.js';
import { toNodeHandler } from 'better-auth/node';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:8080',
        'https://kodingin.com',
        'https://www.kodingin.com',
        'https://vueapp-bice.vercel.app',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],
    credentials: true
}));
app.use(express.json());

const uploadDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

// Mount Better Auth endpoints
app.use("/api/auth", toNodeHandler(auth));

// Initialize Redis client only if REDIS_URL is set
const redis = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, enableOfflineQueue: false }) 
    : null;

if (redis) {
    redis.on('error', (err: any) => {
        console.warn('⚠️ Redis error:', err.message);
    });
}

// Helper to handle cache
const getCached = async (key: string) => {
    if (!redis) return null;
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        return null;
    }
};

const setCache = async (key: string, data: any, ttlSeconds = 60 * 5) => {
    if (!redis) return;
    try {
        await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (err) {}
};

const delCache = async (key: string) => {
    if (!redis) return;
    try {
        await redis.del(key);
    } catch (err) {}
};

// --- ENDPOINTS ---

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Kodingin API Server Running' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/seed', async (req, res) => {
    try {
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

        let userResult;
        try {
            userResult = await auth.api.signUpEmail({
                body: {
                    email: "ophrynt@gmail.com",
                    password: "kodinginmawon",
                    name: "Admin"
                }
            });
        } catch (authErr: any) {
            userResult = { note: "User might already exist or signUp result", error: authErr.message };
        }

        res.json({ status: "success", seeded: true, userResult });
    } catch (err: any) {
        console.error("Seed endpoint error:", err);
        res.status(500).json({ error: err.message || String(err) });
    }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

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

app.post('/api/categories', async (req, res) => {
    try {
        const { name, slug } = req.body;
        const newCategory = await db.insert(schema.categories).values({ name, slug }).returning();

        // Invalidate categories cache
        await delCache('categories:all');

        res.status(201).json(newCategory[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        const categoryId = req.query.category as string;
        const cacheKey = categoryId ? `posts:category:${categoryId}` : 'posts:all';

        let data = await getCached(cacheKey);

        if (!data) {
            const queryParams: any = {
                orderBy: [desc(schema.posts.createdAt)],
                with: {
                    category: true // if joining was setup
                }
            };

            let postsList;
            if (categoryId) {
                postsList = await db.select().from(schema.posts).where(eq(schema.posts.categoryId, parseInt(categoryId))).orderBy(desc(schema.posts.createdAt));
            } else {
                postsList = await db.select().from(schema.posts).orderBy(desc(schema.posts.createdAt));
            }

            data = postsList;
            await setCache(cacheKey, data);
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.post('/api/posts', async (req, res) => {
    try {
        const { title, slug, content, categoryId, imageUrl, createdAt } = req.body;

        const newPost = await db.insert(schema.posts).values({
            title,
            slug,
            content,
            imageUrl,
            categoryId,
            ...(createdAt && { createdAt: new Date(createdAt) }) // Override date if provided
        }).returning();

        // Invalidate posts cache
        await delCache('posts:all');
        if (categoryId) {
            await delCache(`posts:category:${categoryId}`);
        }

        res.status(201).json(newPost[0]);
    } catch (error) {
        console.error("Create Post error:", error)
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.put('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, content, categoryId, imageUrl, createdAt } = req.body;
        console.log("PUT payload received:", { id, title, slug, categoryId, imageUrl, createdAt });

        const updatedPost = await db.update(schema.posts)
            .set({
                title,
                slug,
                content,
                imageUrl,
                categoryId,
                ...(createdAt && { createdAt: new Date(createdAt) })
            })
            .where(eq(schema.posts.id, parseInt(id)))
            .returning();

        if (!updatedPost || updatedPost.length === 0) {
            return res.status(404).json({ error: `Post with ID ${id} not found in database.` });
        }

        // Heavy invalidate
        await delCache('posts:all');
        await delCache(`post:slug:${slug}`);
        if (categoryId) await delCache(`posts:category:${categoryId}`);

        res.json(updatedPost[0]);
    } catch (error) {
        console.error("Edit Post error:", error)
        res.status(500).json({ error: 'Failed to update post' });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPost = await db.delete(schema.posts).where(eq(schema.posts.id, parseInt(id))).returning();

        if (deletedPost.length > 0) {
            await delCache('posts:all');
            await delCache(`post:slug:${deletedPost[0].slug}`);
            await delCache(`posts:category:${deletedPost[0].categoryId}`);
        } else {
            return res.status(404).json({ error: 'Post not found for deletion' });
        }

        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

app.get('/api/posts/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
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

