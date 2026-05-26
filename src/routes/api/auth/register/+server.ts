import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcryptjs';
import { getDb } from '$lib/server/db.js';
import { TutorEntity, VeterinarioEntity } from '$lib/server/entities.js';

export const POST: RequestHandler = async ({ request }) => {
	const { nome, email, telefone, senha, role } = await request.json();

	if (!nome || !email || !telefone || !senha || !role) {
		return json({ erro: 'Todos os campos são obrigatórios' }, { status: 400 });
	}

	const db = await getDb();
	const senhaHash = await bcrypt.hash(senha, 10);

	try {
		if (role === 'veterinario') {
			const repo = db.getRepository(VeterinarioEntity);
			const existente = await repo.findOneBy({ email });
			if (existente) return json({ erro: 'E-mail já cadastrado' }, { status: 400 });
			const vet = repo.create({ nome, email, telefone, senhaHash });
			const salvo = await repo.save(vet);
			return json({ id: salvo.id, msg: 'Usuário criado com sucesso!' });
		} else {
			const repo = db.getRepository(TutorEntity);
			const existente = await repo.findOneBy({ email });
			if (existente) return json({ erro: 'E-mail já cadastrado' }, { status: 400 });
			const tutor = repo.create({ nome, email, telefone, senhaHash });
			const salvo = await repo.save(tutor);
			return json({ id: salvo.id, msg: 'Usuário criado com sucesso!' });
		}
	} catch (err: unknown) {
		return json({ erro: (err as Error).message }, { status: 500 });
	}
};
