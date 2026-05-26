import { redirect } from '@sveltejs/kit';

// Não renderiza no servidor — auth state vive apenas no localStorage
export const ssr = false;

export function load() {
	const session = localStorage.getItem('agendapets_session');
	if (!session) throw redirect(302, '/login');
}
