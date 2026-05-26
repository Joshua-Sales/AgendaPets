import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcryptjs';
import { getDb } from '$lib/server/db.js';
import { TutorEntity, VeterinarioEntity } from '$lib/server/entities.js';
import { signToken } from '$lib/server/auth.js';

export const POST: RequestHandler = async ({ request }) => {
	const { email, senha } = await request.json();

	if (!email || !senha) {
		return json({ erro: 'E-mail e senha são obrigatórios' }, { status: 400 });
	}

	const db = await getDb();

	// Verifica tutores primeiro, depois veterinários
	const tutorRepo = db.getRepository(TutorEntity);
	const tutor = await tutorRepo.findOneBy({ email });
	if (tutor) {
		const valida = await bcrypt.compare(senha, tutor.senhaHash);
		if (!valida) return json({ erro: 'Senha incorreta' }, { status: 401 });
		const token = signToken({ id: tutor.id, email: tutor.email, role: 'tutor' });
		return json({ token, email: tutor.email, role: 'tutor' });
	}

	const vetRepo = db.getRepository(VeterinarioEntity);
	const vet = await vetRepo.findOneBy({ email });
	if (vet) {
		const valida = await bcrypt.compare(senha, vet.senhaHash);
		if (!valida) return json({ erro: 'Senha incorreta' }, { status: 401 });
		const token = signToken({ id: vet.id, email: vet.email, role: 'veterinario' });
		return json({ token, email: vet.email, role: 'veterinario' });
	}

	return json({ erro: 'Usuário não encontrado' }, { status: 401 });
};
