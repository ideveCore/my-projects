import { hash, verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { validate, uuid } from '../../../utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    return {};
  } else {
    return redirect(302, '/user/login');
  }
};

export const actions: Actions = {
  update_theme: async (event) => {
    const formData = await event.request.formData();
    const theme = formData.get('theme')?.toString() || "";

    if (!event.locals.user!.id) {
      return fail(500, { message: 'User not logged' });
    }

    const user_preferences_results = await db
      .select()
      .from(table.user_preferences)
      .where(eq(table.user_preferences.user_id, event.locals.user!.id));
    const user_preferences = user_preferences_results.at(0);

    try {
      if (!user_preferences) {
        await db.insert(table.user_preferences).values({ user_id: event.locals.user!.id, theme, });
      } else {
        await db.update(table.user_preferences).set({
          theme,
        }).where(eq(table.user_preferences.id, user_preferences.id));
      }
    } catch (e) {
      return fail(500, { message: 'An error has occurred' });
    }
    return redirect(302, '/user/preferences');
  },
};
