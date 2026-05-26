import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db.js';
import { TutorEntity } from '$lib/server/entities.js';
import { verifyToken } from '$lib/server/auth.js';

export const GET: RequestHandler = async ({ request }) => {
	const user = verifyToken(request);
	if (user.role !== 'veterinario') {
		return json({ erro: 'Acesso restrito a veterinários' }, { status: 403 });
	}

	const db = await getDb();
	const repo = db.getRepository(TutorEntity);
	const tutores = await repo.find({ order: { nome: 'ASC' } });
	return json(
		tutores.map(({ id, nome, email, telefone, criadoEm }) => ({
			id,
			nome,
			email,
			telefone,
			criadoEm
		}))
	);
};
