import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import * as schema from './db/schema';
import { eq, desc } from 'drizzle-orm';
import { db } from './db';
import { auth } from './auth';
import { toNodeHandler } from 'better-auth/node';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Mount Better Auth endpoints
app.use("/api/auth", toNodeHandler(auth));

// Initialize Redis client. Use REDIS_URL if provided (for docker) else default local port
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// Suppress unhandled redis connection errors when running without a local Redis instance
redis.on('error', (err: any) => {
    if (err.code === 'ECONNREFUSED') {
        console.warn('⚠️  Redis connection refused. Caching will be bypassed.');
    } else {
        console.error('Redis connection error:', err);
    }
});
// Helper to handle cache
const getCached = async (key: string) => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Redis Error:', err);
        return null;
    }
};

const setCache = async (key: string, data: any, ttlSeconds = 60 * 5) => {
    try {
        await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (err) {
        console.error('Redis Set Error:', err);
    }
};

// --- ENDPOINTS ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
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
        await redis.del('categories:all');

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
        await redis.del('posts:all');
        if (categoryId) {
            await redis.del(`posts:category:${categoryId}`);
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
        await redis.del('posts:all');
        await redis.del(`post:slug:${slug}`);
        if (categoryId) await redis.del(`posts:category:${categoryId}`);

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
            await redis.del('posts:all');
            await redis.del(`post:slug:${deletedPost[0].slug}`);
            await redis.del(`posts:category:${deletedPost[0].categoryId}`);
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

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
