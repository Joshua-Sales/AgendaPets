import jwt from 'jsonwebtoken';
import type { Role } from '$lib/types.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

export interface VerifiedUser {
	id: number;
	email: string;
	role: Role;
}

export function signToken(payload: VerifiedUser): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(request: Request): VerifiedUser {
	const header = request.headers.get('Authorization');
	if (!header) throw new Response('Token não fornecido', { status: 401 });

	const token = header.split('Bearer ')[1];
	if (!token) throw new Response('Formato de token inválido', { status: 401 });

	try {
		return jwt.verify(token, JWT_SECRET) as VerifiedUser;
	} catch {
		throw new Response('Token inválido ou expirado', { status: 401 });
	}
}
