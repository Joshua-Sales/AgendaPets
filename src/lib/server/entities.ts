import 'reflect-metadata';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn
} from 'typeorm';

@Entity('tutores')
export class TutorEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'text' })
	nome!: string;

	@Column({ type: 'text', unique: true })
	email!: string;

	@Column({ type: 'text' })
	telefone!: string;

	@Column({ type: 'text' })
	senhaHash!: string;

	@CreateDateColumn()
	criadoEm!: Date;
}

@Entity('veterinarios')
export class VeterinarioEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'text' })
	nome!: string;

	@Column({ type: 'text', unique: true })
	email!: string;

	@Column({ type: 'text' })
	telefone!: string;

	@Column({ type: 'text' })
	senhaHash!: string;

	@CreateDateColumn()
	criadoEm!: Date;
}

@Entity('pets')
export class PetEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'text' })
	nome!: string;

	@Column({ type: 'text' })
	tipo!: string;

	@Column({ type: 'text', default: '' })
	raca!: string;

	@Column({ type: 'integer' })
	tutorId!: number;

	@ManyToOne(() => TutorEntity)
	@JoinColumn({ name: 'tutorId' })
	tutor!: TutorEntity;

	@CreateDateColumn()
	criadoEm!: Date;
}

@Entity('agendamentos')
export class AgendamentoEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'integer' })
	petId!: number;

	@ManyToOne(() => PetEntity)
	@JoinColumn({ name: 'petId' })
	pet!: PetEntity;

	@Column({ type: 'integer' })
	veterinarioId!: number;

	@ManyToOne(() => VeterinarioEntity)
	@JoinColumn({ name: 'veterinarioId' })
	veterinario!: VeterinarioEntity;

	@Column({ type: 'integer' })
	tutorId!: number;

	@ManyToOne(() => TutorEntity)
	@JoinColumn({ name: 'tutorId' })
	tutor!: TutorEntity;

	@Column({ type: 'text' })
	data!: string;

	@Column({ type: 'text' })
	hora!: string;

	@Column({ type: 'text', default: 'pendente' })
	status!: 'pendente' | 'confirmado' | 'cancelado';

	@CreateDateColumn()
	criadoEm!: Date;
}

@Entity('servicos')
export class ServicoEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'text' })
	nome!: string;

	@Column({ type: 'text', default: '' })
	descricao!: string;
}
