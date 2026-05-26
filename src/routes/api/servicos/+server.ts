import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db.js';
import { ServicoEntity } from '$lib/server/entities.js';

export const GET: RequestHandler = async () => {
	const db = await getDb();
	const servicos = await db.getRepository(ServicoEntity).find();
	return json(servicos.length > 0 ? servicos : { msg: 'Nenhum serviço cadastrado.' });
};

export const POST: RequestHandler = async ({ request }) => {
	const { nome, descricao } = await request.json();
	if (!nome) return json({ erro: 'Nome é obrigatório' }, { status: 400 });
	const db = await getDb();
	const repo = db.getRepository(ServicoEntity);
	const servico = repo.create({ nome, descricao: descricao ?? '' });
	const salvo = await repo.save(servico);
	return json({ id: salvo.id });
};
