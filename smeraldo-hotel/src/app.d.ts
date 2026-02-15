// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

/** Staff roles matching the staff_role enum in the database */
type StaffRole = 'manager' | 'reception' | 'housekeeping';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			/** Role of the authenticated staff member, populated by hooks.server.ts */
			userRole: StaffRole | null;
			/** Full name of the authenticated staff member, populated by hooks.server.ts */
			userFullName: string | null;
		}
		interface PageData {
			session: Session | null;
			user: User | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
