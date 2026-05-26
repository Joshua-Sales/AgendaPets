/**
 * Popula o banco de dados com dados de exemplo.
 * Uso: npx tsx scripts/seed.ts
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import bcrypt from 'bcryptjs';
import {
	TutorEntity,
	VeterinarioEntity,
	PetEntity,
	AgendamentoEntity,
	ServicoEntity
} from '../src/lib/server/entities.js';

const db = new DataSource({
	type: 'better-sqlite3',
	database: 'agendapets.sqlite',
	entities: [TutorEntity, VeterinarioEntity, PetEntity, AgendamentoEntity, ServicoEntity],
	synchronize: true
});

async function seed() {
	await db.initialize();
	console.log('✓ Banco conectado');

	const SENHA = await bcrypt.hash('senha123', 10);

	// Veterinários
	const vetRepo = db.getRepository(VeterinarioEntity);
	const vet1 = await vetRepo.save(vetRepo.create({ nome: 'Dra. Ana Lima', email: 'ana@clinica.com', telefone: '11912341234', senhaHash: SENHA }));
	const vet2 = await vetRepo.save(vetRepo.create({ nome: 'Dr. Carlos Melo', email: 'carlos@clinica.com', telefone: '11956785678', senhaHash: SENHA }));
	console.log('✓ Veterinários criados');

	// Tutores
	const tutorRepo = db.getRepository(TutorEntity);
	const t1 = await tutorRepo.save(tutorRepo.create({ nome: 'João Silva', email: 'joao@email.com', telefone: '11999990001', senhaHash: SENHA }));
	const t2 = await tutorRepo.save(tutorRepo.create({ nome: 'Maria Santos', email: 'maria@email.com', telefone: '11999990002', senhaHash: SENHA }));
	const t3 = await tutorRepo.save(tutorRepo.create({ nome: 'Pedro Costa', email: 'pedro@email.com', telefone: '11999990003', senhaHash: SENHA }));
	console.log('✓ Tutores criados');

	// Pets
	const petRepo = db.getRepository(PetEntity);
	const rex    = await petRepo.save(petRepo.create({ nome: 'Rex',    tipo: 'Cachorro', raca: 'Labrador',        tutorId: t1.id }));
	const bolinha= await petRepo.save(petRepo.create({ nome: 'Bolinha',tipo: 'Gato',     raca: 'Persa',           tutorId: t1.id }));
	const luna   = await petRepo.save(petRepo.create({ nome: 'Luna',   tipo: 'Cachorro', raca: 'Golden Retriever',tutorId: t2.id }));
	const simba  = await petRepo.save(petRepo.create({ nome: 'Simba',  tipo: 'Gato',     raca: 'Siamês',          tutorId: t2.id }));
	const pipoca = await petRepo.save(petRepo.create({ nome: 'Pipoca', tipo: 'Coelho',   raca: 'Angorá',          tutorId: t3.id }));
	console.log('✓ Pets criados');

	// Agendamentos
	const agendRepo = db.getRepository(AgendamentoEntity);
	await agendRepo.save([
		agendRepo.create({ petId: rex.id,     veterinarioId: vet1.id, tutorId: t1.id, data: '2026-05-28', hora: '09:00', status: 'confirmado' }),
		agendRepo.create({ petId: bolinha.id, veterinarioId: vet1.id, tutorId: t1.id, data: '2026-05-28', hora: '10:30', status: 'pendente'   }),
		agendRepo.create({ petId: luna.id,    veterinarioId: vet2.id, tutorId: t2.id, data: '2026-05-29', hora: '14:00', status: 'pendente'   }),
		agendRepo.create({ petId: simba.id,   veterinarioId: vet1.id, tutorId: t2.id, data: '2026-05-30', hora: '11:00', status: 'cancelado'  }),
		agendRepo.create({ petId: pipoca.id,  veterinarioId: vet2.id, tutorId: t3.id, data: '2026-06-02', hora: '16:00', status: 'pendente'   }),
	]);
	console.log('✓ Agendamentos criados');

	// Serviços
	const servicoRepo = db.getRepository(ServicoEntity);
	await servicoRepo.save([
		servicoRepo.create({ nome: 'Consulta Geral',      descricao: 'Consulta clínica geral' }),
		servicoRepo.create({ nome: 'Vacinação',           descricao: 'Aplicação de vacinas' }),
		servicoRepo.create({ nome: 'Banho e Tosa',        descricao: 'Higiene e estética' }),
		servicoRepo.create({ nome: 'Exame de Sangue',     descricao: 'Hemograma completo' }),
		servicoRepo.create({ nome: 'Cirurgia',            descricao: 'Procedimentos cirúrgicos' }),
	]);
	console.log('✓ Serviços criados');

	await db.destroy();

	console.log('\n✅ Seed concluído!');
	console.log('\nContas criadas (senha: senha123):');
	console.log('  Veterinários: ana@clinica.com  |  carlos@clinica.com');
	console.log('  Tutores:      joao@email.com   |  maria@email.com   |  pedro@email.com');
}

seed().catch((err) => {
	console.error('❌ Erro no seed:', err.message);
	process.exit(1);
});
