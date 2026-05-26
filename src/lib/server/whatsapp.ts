import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? '';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER ?? '';

export async function enviarMensagem(numero: string, mensagem: string): Promise<void> {
	if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
		console.log('--- MODO DESENVOLVIMENTO (Console) ---');
		console.log(`Para: ${numero}\nMensagem: ${mensagem}`);
		return;
	}

	const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
	const numeroLimpo = numero.replace(/\D/g, '');
	const to = `whatsapp:+${numeroLimpo.startsWith('55') ? numeroLimpo : '55' + numeroLimpo}`;

	try {
		const resp = await client.messages.create({
			from: TWILIO_WHATSAPP_NUMBER,
			to,
			body: mensagem
		});
		console.log(`WhatsApp enviado! SID: ${resp.sid}`);
	} catch (err: unknown) {
		console.error('Erro ao enviar WhatsApp:', (err as Error).message);
	}
}
