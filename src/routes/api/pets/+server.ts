import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db.js';
import { PetEntity } from '$lib/server/entities.js';
import { verifyToken } from '$lib/server/auth.js';

export const GET: RequestHandler = async ({ request, url }) => {
	const user = verifyToken(request);
	const db = await getDb();
	const repo = db.getRepository(PetEntity);

	// Veterinários podem filtrar por tutor_id; tutores só vêem os próprios pets
	const tutorIdParam = url.searchParams.get('tutor_id');
	let tutorId: number;

	if (user.role === 'veterinario' && tutorIdParam) {
		tutorId = parseInt(tutorIdParam);
	} else {
		tutorId = user.id;
	}

	const pets = await repo.findBy({ tutorId });
	return json(pets);
};

export const POST: RequestHandler = async ({ request }) => {
	const user = verifyToken(request);
	const { nome, tipo, raca } = await request.json();

	if (!nome || !tipo) {
		return json({ erro: 'Nome e tipo são obrigatórios' }, { status: 400 });
	}

	const db = await getDb();
	const repo = db.getRepository(PetEntity);
	const pet = repo.create({ nome, tipo, raca: raca ?? '', tutorId: user.id });
	const salvo = await repo.save(pet);
	return json({ id: salvo.id, msg: 'Pet cadastrado!' });
};
