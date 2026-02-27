import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
});

export const posts = sqliteTable('posts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull(), // HTML string from tiptap
    imageUrl: text('image_url'),
    categoryId: integer('category_id')
        .notNull()
        .references(() => categories.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
