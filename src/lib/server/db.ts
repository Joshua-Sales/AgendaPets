import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
	TutorEntity,
	VeterinarioEntity,
	PetEntity,
	AgendamentoEntity,
	ServicoEntity
} from './entities.js';

// Singleton — reutilizado entre requests no mesmo processo
let dataSource: DataSource | null = null;

export async function getDb(): Promise<DataSource> {
	if (dataSource && dataSource.isInitialized) return dataSource;

	dataSource = new DataSource({
		type: 'better-sqlite3',
		database: 'agendapets.sqlite',
		entities: [TutorEntity, VeterinarioEntity, PetEntity, AgendamentoEntity, ServicoEntity],
		synchronize: true // cria/atualiza tabelas automaticamente
	});

	await dataSource.initialize();
	return dataSource;
}
