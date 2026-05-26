import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db.js';
import { AgendamentoEntity } from '$lib/server/entities.js';
import { verifyToken } from '$lib/server/auth.js';

export const PUT: RequestHandler = async ({ request, params }) => {
	verifyToken(request);
	const { data, hora, status } = await request.json();

	const db = await getDb();
	const repo = db.getRepository(AgendamentoEntity);
	const agendamento = await repo.findOneBy({ id: parseInt(params.id) });
	if (!agendamento) return json({ erro: 'Agendamento não encontrado' }, { status: 404 });

	if (data) agendamento.data = data;
	if (hora) agendamento.hora = hora;
	if (status && ['pendente', 'confirmado', 'cancelado'].includes(status)) agendamento.status = status;

	await repo.save(agendamento);
	return json({ msg: 'Agendamento atualizado' });
};

export const DELETE: RequestHandler = async ({ request, params }) => {
	verifyToken(request);
	const db = await getDb();
	const repo = db.getRepository(AgendamentoEntity);
	const agendamento = await repo.findOneBy({ id: parseInt(params.id) });
	if (!agendamento) return json({ erro: 'Agendamento não encontrado' }, { status: 404 });
	await repo.remove(agendamento);
	return json({ msg: 'Agendamento removido' });
};
