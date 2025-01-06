import { dirname } from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { CPTO } from './cpto';
import mime from 'mime-types';

interface ReturnType {
	error: boolean;
	message: string;
	details?: any;
}

export class FS {
	constructor() {}

	public async make_dir({ dir }: { dir: string }): Promise<ReturnType> {
		try {
			await mkdir(dir, { recursive: true });
			return { error: false, message: 'Directory created successfully' };
		} catch (error) {
			return { error: true, message: 'Error when creating directory', details: error };
		}
	}

	public async make_file({
		file,
		content
	}: {
		file: string;
		content: Buffer<ArrayBuffer> | Buffer<ArrayBufferLike>;
	}): Promise<ReturnType> {
		try {
			await this.make_dir({ dir: dirname(file) });
			await writeFile(file, content);
			return { error: false, message: 'File created successfully' };
		} catch (error) {
			return { error: true, message: 'Error when creating file', details: error };
		}
	}

	public async read_file({ file }: { file: string }): Promise<Buffer | ReturnType> {
		try {
			return await readFile(file);
		} catch (error) {
			return { error: true, message: 'Error when creating file', details: error };
		}
	}

	public async make_encripted_file({
		dir,
		file_name,
		file,
		algorithm,
		key,
		iv
	}: {
		dir: string;
		file_name: string;
		file: File;
		algorithm: string;
		key: string;
		iv: string;
	}): Promise<ReturnType> {
		try {
			const content = new CPTO({ algorithm, key, iv }).encrypt_content(
				Buffer.from(new Uint8Array(await file.arrayBuffer()).buffer)
			);
			await this.make_file({ file: `${dir}/${file_name}.enc`, content });
			return { error: false, message: 'Suceffuly save file!' };
		} catch (error) {
			return { error: false, message: 'Error to save file!', details: error };
		}
	}

	public async make_decripted_file({
		from_file,
		to_file,
		type,
		algorithm,
		key,
		iv
	}: {
		from_file: string;
		to_file: string;
		type: string;
		algorithm: string;
		key: string;
		iv: string;
	}): Promise<ReturnType> {
		const encripted_file = await this.read_file({ file: `${from_file}.enc` });

		if ('error' in encripted_file) {
			return { error: true, message: 'Erro to read file' };
		}
		const content = new CPTO({
			algorithm,
			key,
			iv
		}).decrypt_content(encripted_file);
		if (!content) {
			return { error: true, message: 'Erro to decrypt file content' };
		}
		return await this.make_file({ file: `${to_file}.${mime.extension(type)}`, content });
	}
}
