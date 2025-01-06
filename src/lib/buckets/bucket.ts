import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import { FS } from './fs';

export class Bucket {
	public id: string | undefined | null = null;
	public user_id: string | undefined | null = null;
	public name: string | undefined | null = null;
	public key: string | undefined | null = null;

	public async get({ user_id }: { user_id: string }): Promise<Bucket> {
		const bucket = (
			await db.select().from(table.user_bucket).where(eq(table.user_bucket.user_id, user_id))
		).at(0);

		if (bucket) {
			this.id = bucket.id;
			this.key = bucket.key;
			this.name = bucket.name;
			this.user_id = bucket.user_id;
		} else {
			await this.do_bucket({ user_id });
		}
		return this;
	}

	private async do_bucket({
		user_id
	}: {
		user_id: string;
	}): Promise<{ error: boolean; message: string; details?: any }> {
		try {
			const bucket: table.UserBucket | undefined = (
				await db.insert(table.user_bucket).values({ user_id }).returning()
			).at(0);
			this.id = bucket?.id;
			this.key = bucket?.key;
			this.name = bucket?.name;
			this.user_id = bucket?.user_id;
			await new FS().make_dir({ dir: `files/buckets/${this.name}` });
			return { error: false, message: 'Bucket created successfully' };
		} catch (error) {
			return { error: true, message: 'An error has occurred', details: error };
		}
	}

	public async do_file({
		dir,
		file
	}: {
		dir: string;
		file: File;
	}): Promise<
		table.BucketFiles | undefined | { error: boolean; message?: string; details?: unknown }
	> {
		const key = crypto.randomBytes(32).toString('hex');
		const iv = crypto.randomBytes(16).toString('hex');
		try {
			const bucket_file = (
				await db
					.insert(table.bucket_files)
					.values({
						bucket_id: this.id,
						size: file.size,
						type: file.type,
						name: file.name,
						dir,
						key,
						iv
					})
					.returning()
			).at(0);

			const encripted_file = await new FS().make_encripted_file({
				dir: `files/buckets/${this.name}/${dir}`,
				file_name: bucket_file?.file!,
				file,
				algorithm: bucket_file?.algorithm!,
				key: bucket_file?.key!,
				iv: bucket_file?.iv!
			});

			if (encripted_file) {
				return bucket_file;
			} else {
				throw new Error('Erro to save file');
			}
		} catch (error) {
			return { error: true, message: 'An error has occurred', details: error };
		}
	}

	public async get_file({
		file_id
	}: {
		file_id: string;
	}): Promise<
		table.BucketFilesTmp | undefined | { error: boolean; message: string; details?: any }
	> {
		const bucket_file = (
			await db.select().from(table.bucket_files).where(eq(table.bucket_files.id, file_id))
		).at(0);

		if (!bucket_file) {
			return { error: true, message: 'File not found!' };
		}

		const bucket_file_tmp = (
			await db
				.select()
				.from(table.bucket_files_tmp)
				.where(eq(table.bucket_files_tmp.file_id, bucket_file.id))
		).at(0);

		if (bucket_file_tmp) {
			return bucket_file_tmp;
		}

		if (
			!(
				await new FS().make_decripted_file({
					from_file: `files/buckets/${this.name}/${bucket_file.dir}/${bucket_file.file}`,
					to_file: `files/tmp/${bucket_file.file}`,
					type: bucket_file.type!,
					algorithm: bucket_file.algorithm!,
					key: bucket_file.key!,
					iv: bucket_file.iv!
				})
			).error
		) {
			const currentDate = new Date();
			currentDate.setHours(currentDate.getHours() + 1);
			return (
				await db
					.insert(table.bucket_files_tmp)
					.values({
						bucket_id: this.id,
						file_id: bucket_file.id,
						size: bucket_file.size,
						type: bucket_file.type,
						name: bucket_file.name,
						dir: 'files/tmp/',
						file: bucket_file.file,
						expiresAt: currentDate
					})
					.returning()
			).at(0);
		} else {
			return { error: true, message: 'Error to create decrypted file!' };
		}
	}
}
