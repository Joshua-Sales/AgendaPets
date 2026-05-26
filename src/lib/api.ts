import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth.js';
import { goto } from '$app/navigation';

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
	const session = get(authStore);
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>)
	};

	if (session?.token) {
		headers['Authorization'] = `Bearer ${session.token}`;
	}

	const response = await fetch(url, { ...options, headers });

	if (response.status === 401) {
		authStore.logout();
		goto('/login');
		throw new Error('Sessão expirada');
	}

	return response;
}
