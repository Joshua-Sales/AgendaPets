export interface Tutor {
	id: number;
	nome: string;
	email: string;
	telefone: string;
	criadoEm: Date;
}

export interface Veterinario {
	id: number;
	nome: string;
	email: string;
	telefone: string;
	criadoEm: Date;
}

export interface Pet {
	id: number;
	nome: string;
	tipo: string;
	raca: string;
	tutorId: number;
	criadoEm: Date;
}

export interface Agendamento {
	id: number;
	petId: number;
	veterinarioId: number;
	tutorId: number;
	data: string;
	hora: string;
	status: 'pendente' | 'confirmado' | 'cancelado';
	// campos enriquecidos retornados pelo GET
	petNome?: string;
	petTipo?: string;
	tutorNome?: string;
	veterinarioNome?: string;
}

export type Role = 'tutor' | 'veterinario';

export interface UserSession {
	id: number;
	email: string;
	role: Role;
	token: string;
}
