import { hash, verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validate, uuid } from '../../../utils';
import { Bucket, multer_middleware } from '../../../bucket';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	register: async (event) => {
		const formData = await event.request.formData();
		const redirect_to = formData.get("redirect")?.toString() || "/";

		if (event.locals.user) {
			const name = formData.get('name')?.toString() || "";
			const old_password = formData.get('old_password')?.toString() || "";
			const password = formData.get('password')?.toString() || "";
			const birth_date = formData.get('birth_date')?.toString() || "";
			const avatar = formData.get('avatar');

			const user_result = await db.select().from(table.user).where(eq(table.user.id, event.locals.user!.id));
			const user = user_result.at(0);
			const update_data: {
				name?: string | undefined;
				birth_date?: string;
				passwordHash?: string
			} = {};

			if (!user) {
				return fail(400, { message: 'User not logged!' });
			}

			if (validate.password(old_password) && validate.password(password)) {
				const validPassword = await verify(user.passwordHash, old_password, {
					memoryCost: 19456,
					timeCost: 2,
					outputLen: 32,
					parallelism: 1
				});
				if (!validPassword) {
					return fail(400, { message: 'Incorrect old password' });
				}
				const password_hash = await hash(password, {
					memoryCost: 19456,
					timeCost: 2,
					outputLen: 32,
					parallelism: 1
				});
				update_data.passwordHash = password_hash;
			} else if ((old_password.length > 0 && password.length === 0) ||
				(password.length > 0 && old_password.length == 0)) {
				return fail(400, { message: 'For password exchange the two fields need to be filled in correctness!' });
			}

			if (name) {
				update_data.name = name;
			}
			if (birth_date) {
				update_data.birth_date = birth_date;
			}

			if (Object.keys(update_data).length == 0) {
				return fail(400, { message: 'Nothing to do!' });
			}

			try {
				await db.update(table.user).set(update_data).where(eq(table.user.id, user.id));
				const bucket = await new Bucket({ user_id: user.id }).get();
				// multer_middleware(event.request, event.locals, "/user_preferences", bucket, async () => {
				// 	console.log("finished!");
				// });
				bucket.operations().mkfil_bucket('user_preferences', avatar);
			} catch (e) {
				return fail(500, { message: 'An error has occurred' });
			}
		} else {
			const name = formData.get('name')?.toString() || "";
			const email = formData.get('email')?.toString() || "";
			const password = formData.get('password')?.toString() || "";

			if (!validate.email(email)) {
				return fail(400, { message: 'Invalid email' });
			}
			if (!validate.password(password)) {
				return fail(400, { message: 'Invalid password' });
			}

			const user_id = uuid();
			const passwordHash = await hash(password, {
				// recommended minimum parameters
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			try {
				await db.insert(table.user).values({ id: user_id, name, email, passwordHash });

				const sessionToken = auth.generateSessionToken();
				const session = await auth.createSession(sessionToken, user_id);
				auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
			} catch (e) {
				return fail(500, { message: 'An error has occurred' });
			}
		}

		return redirect(302, redirect_to);
	}
};
