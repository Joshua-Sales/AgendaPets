import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db.js';
import { AgendamentoEntity } from '$lib/server/entities.js';
import { verifyToken } from '$lib/server/auth.js';

export const PATCH: RequestHandler = async ({ request, params }) => {
	verifyToken(request);
	const { status } = await request.json();

	if (!['confirmado', 'cancelado', 'pendente'].includes(status)) {
		return json({ erro: 'Status inválido' }, { status: 400 });
	}

	const db = await getDb();
	const repo = db.getRepository(AgendamentoEntity);
	const agendamento = await repo.findOneBy({ id: parseInt(params.id) });

	if (!agendamento) return json({ erro: 'Agendamento não encontrado' }, { status: 404 });

	agendamento.status = status;
	await repo.save(agendamento);
	return json({ msg: 'Status atualizado com sucesso' });
};
