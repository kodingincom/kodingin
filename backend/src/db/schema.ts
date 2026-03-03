import { pgTable, text, timestamp, serial, integer, boolean } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
});

export const posts = pgTable('posts', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull(), // HTML string from tiptap
    imageUrl: text('image_url'),
    categoryId: integer('category_id')
        .notNull()
        .references(() => categories.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').notNull(),
    image: text('image'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
});

export const session = pgTable('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
        .notNull()
        .references(() => user.id),
});

export const account = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId')
        .notNull()
        .references(() => user.id),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
});

export const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt'),
});
