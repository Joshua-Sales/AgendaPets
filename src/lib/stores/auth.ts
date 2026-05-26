import { writable } from 'svelte/store';
import type { UserSession } from '$lib/types.js';

function createAuthStore() {
	const stored =
		typeof window !== 'undefined' ? localStorage.getItem('agendapets_session') : null;
	const initial: UserSession | null = stored ? JSON.parse(stored) : null;

	const { subscribe, set } = writable<UserSession | null>(initial);

	return {
		subscribe,
		login(session: UserSession) {
			localStorage.setItem('agendapets_session', JSON.stringify(session));
			set(session);
		},
		logout() {
			localStorage.removeItem('agendapets_session');
			set(null);
		}
	};
}

export const authStore = createAuthStore();
