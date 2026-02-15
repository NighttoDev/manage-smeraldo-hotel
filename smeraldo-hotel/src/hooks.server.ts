import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';

/** Routes that don't require authentication */
const PUBLIC_ROUTES = ['/login', '/auth'];

function isPublicRoute(pathname: string): boolean {
	return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

function isStaticAsset(pathname: string): boolean {
	return (
		pathname.startsWith('/_app/') ||
		pathname.startsWith('/icons/') ||
		pathname === '/favicon.png' ||
		pathname === '/robots.txt' ||
		pathname.endsWith('.webmanifest')
	);
}

export const handle: Handle = async ({ event, resolve }) => {
	// Create Supabase server client with cookie-based session handling
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	/**
	 * Safe session getter — validates JWT via auth.getUser() first.
	 * NEVER trust auth.getSession() alone on the server.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error || !user) {
			return { session: null, user: null };
		}

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		return { session, user };
	};

	// Initialise role locals to null — populated below if user is authenticated
	event.locals.userRole = null;
	event.locals.userFullName = null;

	// Skip auth check for static assets
	if (isStaticAsset(event.url.pathname)) {
		return resolve(event);
	}

	const { session, user } = await event.locals.safeGetSession();

	if (user && session) {
		// Fetch staff profile to verify account is active and cache role on locals
		const { data: profile } = await event.locals.supabase
			.from('staff_members')
			.select('is_active, role, full_name')
			.eq('id', user.id)
			.single();

		if (!profile) {
			// Auth user exists but no staff_members record — sign out and redirect
			await event.locals.supabase.auth.signOut();
			redirect(303, '/login?reason=no_profile');
		}

		if (!profile.is_active) {
			// Staff account has been deactivated by a manager — sign out and redirect
			await event.locals.supabase.auth.signOut();
			redirect(303, '/login?reason=deactivated');
		}

		// Cache role and name on locals — used by requireRole() to avoid extra DB queries
		event.locals.userRole = profile.role as App.Locals['userRole'];
		event.locals.userFullName = profile.full_name as string;
	}

	// Auth gate — redirect unauthenticated users to /login
	if (!isPublicRoute(event.url.pathname) && !session) {
		redirect(303, '/login');
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name: string) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
