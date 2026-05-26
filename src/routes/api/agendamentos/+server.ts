import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db.js';
import {
	AgendamentoEntity,
	PetEntity,
	TutorEntity,
	VeterinarioEntity
} from '$lib/server/entities.js';
import { verifyToken } from '$lib/server/auth.js';
import { enviarMensagem } from '$lib/server/whatsapp.js';

export const GET: RequestHandler = async ({ request }) => {
	const user = verifyToken(request);
	const db = await getDb();
	const repo = db.getRepository(AgendamentoEntity);

	if (user.role === 'tutor') {
		const agendamentos = await repo.find({
			where: { tutorId: user.id },
			relations: { pet: true, veterinario: true },
			order: { data: 'DESC' }
		});
		return json(
			agendamentos.map((a) => ({
				id: a.id,
				petId: a.petId,
				petNome: a.pet?.nome,
				petTipo: a.pet?.tipo,
				veterinarioId: a.veterinarioId,
				veterinarioNome: a.veterinario?.nome,
				tutorId: a.tutorId,
				data: a.data,
				hora: a.hora,
				status: a.status
			}))
		);
	} else {
		// veterinário vê todos os agendamentos dele com dados do tutor e pet
		const agendamentos = await repo.find({
			where: { veterinarioId: user.id },
			relations: { pet: true, tutor: true },
			order: { data: 'DESC' }
		});
		return json(
			agendamentos.map((a) => ({
				id: a.id,
				petId: a.petId,
				petNome: a.pet?.nome,
				petTipo: a.pet?.tipo,
				veterinarioId: a.veterinarioId,
				tutorId: a.tutorId,
				tutorNome: a.tutor?.nome,
				data: a.data,
				hora: a.hora,
				status: a.status
			}))
		);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const user = verifyToken(request);
	if (user.role !== 'veterinario') {
		return json({ erro: 'Apenas veterinários podem criar agendamentos' }, { status: 403 });
	}

	const { pet_id, data, hora } = await request.json();
	if (!pet_id || !data || !hora) {
		return json({ erro: 'pet_id, data e hora são obrigatórios' }, { status: 400 });
	}

	const db = await getDb();
	const petRepo = db.getRepository(PetEntity);
	const pet = await petRepo.findOne({ where: { id: pet_id }, relations: { tutor: true } });
	if (!pet) return json({ erro: 'Pet não encontrado' }, { status: 404 });

	// Verifica conflito de horário
	const agendRepo = db.getRepository(AgendamentoEntity);
	const conflito = await agendRepo.findOne({
		where: { veterinarioId: user.id, data, hora }
	});
	if (conflito) {
		return json({ erro: 'Já existe um agendamento neste horário' }, { status: 409 });
	}

	const agendamento = agendRepo.create({
		petId: pet.id,
		veterinarioId: user.id,
		tutorId: pet.tutorId,
		data,
		hora,
		status: 'pendente'
	});
	const salvo = await agendRepo.save(agendamento);

	// Envia WhatsApp ao tutor
	const vetRepo = db.getRepository(VeterinarioEntity);
	const vet = await vetRepo.findOneBy({ id: user.id });
	const tutorRepo = db.getRepository(TutorEntity);
	const tutor = await tutorRepo.findOneBy({ id: pet.tutorId });
	if (tutor && vet) {
		const [ano, mes, dia] = data.split('-');
		const dataFormatada = `${dia}/${mes}/${ano}`;
		await enviarMensagem(
			tutor.telefone,
			`Olá ${tutor.nome}! O Dr(a). ${vet.nome} agendou uma consulta para ${pet.nome} no dia ${dataFormatada} às ${hora}. Por favor, confirme ou desmarque a consulta acessando seu painel.`
		);
	}

	return json({ id: salvo.id, msg: 'Agendamento criado com sucesso!' });
};
