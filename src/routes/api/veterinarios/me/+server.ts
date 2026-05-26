import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db.js';
import { VeterinarioEntity } from '$lib/server/entities.js';
import { verifyToken } from '$lib/server/auth.js';

export const GET: RequestHandler = async ({ request }) => {
	const user = verifyToken(request);
	const db = await getDb();
	const repo = db.getRepository(VeterinarioEntity);
	const vet = await repo.findOneBy({ id: user.id });
	if (!vet) return json({ erro: 'Veterinário não encontrado' }, { status: 404 });
	const { id, nome, email, telefone, criadoEm } = vet;
	return json({ id, nome, email, telefone, criadoEm });
};

export const PUT: RequestHandler = async ({ request }) => {
	const user = verifyToken(request);
	const { nome, telefone } = await request.json();

	const db = await getDb();
	const repo = db.getRepository(VeterinarioEntity);
	const vet = await repo.findOneBy({ id: user.id });
	if (!vet) return json({ erro: 'Veterinário não encontrado' }, { status: 404 });

	if (nome) vet.nome = nome;
	if (telefone) vet.telefone = telefone;
	await repo.save(vet);
	return json({ msg: 'Perfil atualizado' });
};
