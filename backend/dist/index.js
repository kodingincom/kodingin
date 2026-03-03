"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ioredis_1 = __importDefault(require("ioredis"));
const schema = __importStar(require("./db/schema"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("./db");
const auth_1 = require("./auth");
const node_1 = require("better-auth/node");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)({
    origin: [process.env.FRONTEND_URL || 'http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express_1.default.json());
const uploadDir = path_1.default.join(__dirname, '../public/uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
app.use('/uploads', express_1.default.static(uploadDir));
// Mount Better Auth endpoints
app.use("/api/auth", (0, node_1.toNodeHandler)(auth_1.auth));
// Initialize Redis client. Use REDIS_URL if provided (for docker) else default local port
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
// Suppress unhandled redis connection errors when running without a local Redis instance
redis.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
        console.warn('⚠️  Redis connection refused. Caching will be bypassed.');
    }
    else {
        console.error('Redis connection error:', err);
    }
});
// Helper to handle cache
const getCached = async (key) => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    }
    catch (err) {
        console.error('Redis Error:', err);
        return null;
    }
};
const setCache = async (key, data, ttlSeconds = 60 * 5) => {
    try {
        await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    }
    catch (err) {
        console.error('Redis Set Error:', err);
    }
};
// --- ENDPOINTS ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
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
            data = await db_1.db.query.categories.findMany();
            await setCache(cacheKey, data);
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
app.post('/api/categories', async (req, res) => {
    try {
        const { name, slug } = req.body;
        const newCategory = await db_1.db.insert(schema.categories).values({ name, slug }).returning();
        // Invalidate categories cache
        await redis.del('categories:all');
        res.status(201).json(newCategory[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});
app.get('/api/posts', async (req, res) => {
    try {
        const categoryId = req.query.category;
        const cacheKey = categoryId ? `posts:category:${categoryId}` : 'posts:all';
        let data = await getCached(cacheKey);
        if (!data) {
            const queryParams = {
                orderBy: [(0, drizzle_orm_1.desc)(schema.posts.createdAt)],
                with: {
                    category: true // if joining was setup
                }
            };
            let postsList;
            if (categoryId) {
                postsList = await db_1.db.select().from(schema.posts).where((0, drizzle_orm_1.eq)(schema.posts.categoryId, parseInt(categoryId))).orderBy((0, drizzle_orm_1.desc)(schema.posts.createdAt));
            }
            else {
                postsList = await db_1.db.select().from(schema.posts).orderBy((0, drizzle_orm_1.desc)(schema.posts.createdAt));
            }
            data = postsList;
            await setCache(cacheKey, data);
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});
app.post('/api/posts', async (req, res) => {
    try {
        const { title, slug, content, categoryId, imageUrl, createdAt } = req.body;
        const newPost = await db_1.db.insert(schema.posts).values({
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
    }
    catch (error) {
        console.error("Create Post error:", error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});
app.put('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, content, categoryId, imageUrl, createdAt } = req.body;
        console.log("PUT payload received:", { id, title, slug, categoryId, imageUrl, createdAt });
        const updatedPost = await db_1.db.update(schema.posts)
            .set({
            title,
            slug,
            content,
            imageUrl,
            categoryId,
            ...(createdAt && { createdAt: new Date(createdAt) })
        })
            .where((0, drizzle_orm_1.eq)(schema.posts.id, parseInt(id)))
            .returning();
        if (!updatedPost || updatedPost.length === 0) {
            return res.status(404).json({ error: `Post with ID ${id} not found in database.` });
        }
        // Heavy invalidate
        await redis.del('posts:all');
        await redis.del(`post:slug:${slug}`);
        if (categoryId)
            await redis.del(`posts:category:${categoryId}`);
        res.json(updatedPost[0]);
    }
    catch (error) {
        console.error("Edit Post error:", error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPost = await db_1.db.delete(schema.posts).where((0, drizzle_orm_1.eq)(schema.posts.id, parseInt(id))).returning();
        if (deletedPost.length > 0) {
            await redis.del('posts:all');
            await redis.del(`post:slug:${deletedPost[0].slug}`);
            await redis.del(`posts:category:${deletedPost[0].categoryId}`);
        }
        else {
            return res.status(404).json({ error: 'Post not found for deletion' });
        }
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});
app.get('/api/posts/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const cacheKey = `post:slug:${slug}`;
        let data = await getCached(cacheKey);
        if (!data) {
            const postArray = await db_1.db.select().from(schema.posts).where((0, drizzle_orm_1.eq)(schema.posts.slug, slug));
            data = postArray.length > 0 ? postArray[0] : null;
            if (data) {
                await setCache(cacheKey, data);
            }
        }
        if (!data)
            return res.status(404).json({ error: 'Post not found' });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});
app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Backend server running on 0.0.0.0:${port}`);
});
//# sourceMappingURL=index.js.map