import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    const user_result = await db.select({
      email: table.user.email,
      name: table.user.name,
    }).from(table.user).where(eq(table.user.email, event.locals.user.email));
    const user = user_result.at(0);
    const user_preferences_result = await db
      .select({
        theme: table.user_preferences.theme,
      })
      .from(table.user_preferences)
      .where(eq(table.user_preferences.user_id, event.locals.user!.id));
    const user_preferences = user_preferences_result.at(0);
    return { user, user_preferences };
  } else {
    return redirect(302, '/user/login');
  }
};