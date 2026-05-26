import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db.js';
import { VeterinarioEntity } from '$lib/server/entities.js';
import { verifyToken } from '$lib/server/auth.js';

export const GET: RequestHandler = async ({ request }) => {
	verifyToken(request);
	const db = await getDb();
	const repo = db.getRepository(VeterinarioEntity);
	const vets = await repo.find({ order: { nome: 'ASC' } });
	return json(
		vets.map(({ id, nome, email, telefone, criadoEm }) => ({ id, nome, email, telefone, criadoEm }))
	);
};
