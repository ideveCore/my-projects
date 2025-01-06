import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { Bucket } from '../lib/buckets/bucket';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const user =
			(
				await db
					.select({
						email: table.user.email,
						name: table.user.name,
						birth_date: table.user.birth_date,
						avatar: table.user.avatar
					})
					.from(table.user)
					.where(eq(table.user.email, event.locals.user.email))
			).at(0) || {};
		const user_preferences_result = await db
			.select({
				theme: table.user_preferences.theme
			})
			.from(table.user_preferences)
			.where(eq(table.user_preferences.user_id, event.locals.user!.id));
		const user_preferences = user_preferences_result.at(0) || {};
		const user_bucket = await new Bucket().get({ user_id: event.locals.user!.id });
		if ('email' in user) {
			const avatar = (await user_bucket.get_file({ file_id: user.avatar }))!;
			user.avatar = {
				dir: avatar.dir,
				name: avatar.name,
				type: avatar.type,
				size: avatar.size,
				file: avatar.file
			};
		}
		return { user, user_preferences };
	} else {
		return { user: {}, user_preferences: {} };
	}
};
