import { pgTable, serial, text, integer, timestamp, uuid, date } from 'drizzle-orm/pg-core';
import { sql } from "drizzle-orm";

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	birth_date: date('birth_date'),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const user_preferences = pgTable('user_preferences', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	user_id: text('user_id'),
	theme: text("theme").default('auto')
});

export const user_bucket = pgTable('user_bucket', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	user_id: text('user_id'),
	name: uuid('name').unique().default(sql`gen_random_uuid()`),
	key: uuid('key').unique().default(sql`gen_random_uuid()`),
});

export const bucket_files = pgTable('bucket_files', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	bucket_id: text('bucket_id'),
	size: integer("size"),
	type: text("type"),
	name: text("name"),
	dir: text("dir"),
	file: text("file").unique().default(sql`gen_random_uuid()`),
	key: uuid('key').unique().default(sql`gen_random_uuid()`),
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type UserPreferences = typeof user_preferences.$inferSelect;
export type UserBucket = typeof user_bucket.$inferSelect;
export type BucketFiles = typeof bucket_files.$inferSelect;
