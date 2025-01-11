import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export async function GET(event) {
	auth.deleteSessionTokenCookie(event);
	return redirect(302, '/user/login');
}
