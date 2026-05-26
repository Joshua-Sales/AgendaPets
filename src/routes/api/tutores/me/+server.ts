import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db.js';
import { TutorEntity } from '$lib/server/entities.js';
import { verifyToken } from '$lib/server/auth.js';

export const GET: RequestHandler = async ({ request }) => {
	const user = verifyToken(request);
	const db = await getDb();
	const repo = db.getRepository(TutorEntity);
	const tutor = await repo.findOneBy({ id: user.id });
	if (!tutor) return json({ erro: 'Tutor não encontrado' }, { status: 404 });
	const { id, nome, email, telefone, criadoEm } = tutor;
	return json({ id, nome, email, telefone, criadoEm });
};

export const PUT: RequestHandler = async ({ request }) => {
	const user = verifyToken(request);
	const { nome, telefone } = await request.json();

	const db = await getDb();
	const repo = db.getRepository(TutorEntity);
	const tutor = await repo.findOneBy({ id: user.id });
	if (!tutor) return json({ erro: 'Tutor não encontrado' }, { status: 404 });

	if (nome) tutor.nome = nome;
	if (telefone) tutor.telefone = telefone;
	await repo.save(tutor);
	return json({ msg: 'Perfil atualizado' });
};
