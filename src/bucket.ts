import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import crypto from "crypto";
import { mkdir, readFile, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __base_dir = path.resolve(__dirname, '..');

export class Bucket {
  private user_id: string;
  private user: table.User | undefined;
  private bucket: table.UserBucket | undefined;
  public bucket_path: string = `${__base_dir}/files/buckets`;
  public name: string | undefined | null = '';

  constructor({ user_id }: { user_id: string }) {
    this.user_id = user_id;
  }

  public async get(): Promise<Bucket> {
    const user_result = await db
      .select()
      .from(table.user)
      .where(eq(table.user.id, this.user_id));
    const user_bucket_result = await db
      .select()
      .from(table.user_bucket)
      .where(eq(table.user_bucket.user_id, this.user_id));
    this.user = user_result.at(0);
    this.bucket = user_bucket_result.at(0);
    this.name = this.bucket?.name;
    return this;
  }

  private async do_bucket(): Promise<{ error: boolean, message: string, bucket?: table.UserBucket | undefined }> {
    try {
      await db.insert(table.user_bucket).values({ user_id: this.user_id });

      return { error: false, bucket: (await this.get()).bucket, message: "sucefully saved!" }
    } catch (e) {
      return { error: true, message: 'An error has occurred' }
    }
  }

  private async do_file({ size, type, name, dir }: { size: number, type: string, name: string, dir: string }): Promise<{ error: boolean, message?: string, details?: unknown, bucket_file?: table.BucketFiles }> {
    try {
      return {
        error: false, bucket_file: (await db.insert(table.bucket_files).values({
          bucket_id: this.bucket!.id,
          size,
          type,
          name,
          dir,
        }).returning({
          id: table.bucket_files.id,
          bucket_id: table.bucket_files.bucket_id,
          size: table.bucket_files.size,
          type: table.bucket_files.type,
          name: table.bucket_files.name,
          dir: table.bucket_files.name,
          file: table.bucket_files.file,
          key: table.bucket_files.key,
        })).at(0),
      };

    } catch (error) {
      return { error: true, message: 'An error has occurred', details: error }
    }
  }

  public async get_file({ key }: { key: string }): Promise<table.BucketFiles | undefined> {
    const bucket_file_result = await db
      .select()
      .from(table.bucket_files)
      .where(eq(table.bucket_files.key, key));
    return bucket_file_result.at(0);
  }

  public async build() {
    if (!this.bucket) {
      this.bucket = (await this.do_bucket()).bucket;
    }
    this.operations().mkdir_bucket();
    return { bucket: this.bucket }
  }

  public operations(): { mkdir_bucket: () => void, mkfil_bucket: (dir: string, file: File) => void, } {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const make_dir = async (dir_path: string) => {
      try {
        await mkdir(dir_path, { recursive: true });
      } catch (err) {
        console.error(`Error to make dir: ${err}`);
      }
    }

    const encrypt_content = (buffer: Buffer): Buffer<ArrayBuffer> => {
      let encrypted_data = cipher.update(buffer);
      return Buffer.concat([encrypted_data, cipher.final()]);
    }

    const mkfil_bucket = async (dir: string, file: File) => {
      const { error, bucket_file }: { error: boolean, message?: string, details?: unknown, bucket_file?: table.BucketFiles } = await this.do_file({ size: file.size, type: file.type, name: file.name.split(".")[0], dir });
      if (!error) {
        const encrypted_data = encrypt_content(Buffer.from(new Uint8Array(await file.arrayBuffer()).buffer));
        await make_dir(`${this.bucket_path}/${this.bucket?.name}/${dir}`);
        await writeFile(`${this.bucket_path}/${this.bucket?.name}/${dir}/${bucket_file?.file}.enc`, encrypted_data);
      }
    }

    const mkdir_bucket = async () => {
      await make_dir(`${this.bucket_path}/${this.bucket?.name}`);
    }

    return {
      mkdir_bucket,
      mkfil_bucket,
    }
  }
}