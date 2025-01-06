import path from 'path';
import { error } from '@sveltejs/kit';
import fs from 'fs';
import { Bucket } from '$lib/buckets/bucket';
import { FS } from '$lib/buckets/fs';
import { fs_types } from '../../../store.js';

export async function GET({ params, locals }) {
	if (locals.user) {
		const { file } = params;
		const user_bucket = await new Bucket().get({ user_id: locals.user!.id });
		const file_tmp = (await user_bucket.get_file({ file_id: file }))!;
		let file_ext = '';

		if (!('id' in file_tmp)) {
			throw error(404, 'File not found!');
		}

		fs_types.subscribe((value) => {
			const ext_result = value.extension({ type: file_tmp.type! });
			if (typeof ext_result == 'string') {
				file_ext = ext_result;
			} else {
				throw error(404, ext_result.message);
			}
		});

		const file_path = path.resolve('files/tmp', `${file_tmp.file}.${file_ext}`);
		if (!fs.existsSync(file_path)) {
			throw error(404, 'File not found!');
		}

		const buffer = (await new FS().read_file({
			file: `files/tmp/${file_tmp.file}.${file_ext}`
		})) as Buffer;

		return new Response(buffer, {
			headers: {
				'Content-Type': file_tmp.type || ''
			}
		});
	} else {
		throw error(404, 'User not logged!');
	}
}
