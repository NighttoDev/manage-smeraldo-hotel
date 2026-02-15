// Server-only — never import from .svelte components (src/lib/server/ is compile-time enforced)
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/db/types';

/**
 * Creates a Supabase admin client using the service_role key.
 * Required for admin operations like creating/deleting auth users.
 * Session management is disabled — this client is stateless and server-only.
 */
export function createAdminClient() {
	return createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}
