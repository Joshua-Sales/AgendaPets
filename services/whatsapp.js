const twilio = require('twilio');

/**
 * Envia uma mensagem real via WhatsApp utilizando a API da Twilio.
 * Se as variáveis de ambiente não estiverem configuradas, ele apenas logará no console (fallback).
 */
async function enviarMensagem(numero, mensagem) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log("--- MODO DESENVOLVIMENTO (Console) ---");
    console.log(`Para: ${numero}\nMensagem: ${mensagem}`);
    return;
  }

  const client = twilio(accountSid, authToken);

  try {
    // Limpa o número de caracteres especiais e garante o prefixo +55 para o Brasil
    const numeroLimpo = numero.replace(/\D/g, '');
    const to = `whatsapp:+${numeroLimpo.startsWith('55') ? numeroLimpo : '55' + numeroLimpo}`;

    const response = await client.messages.create({
      from: fromNumber,
      to: to,
      body: mensagem
    });

    console.log(`✅ WhatsApp enviado com sucesso! SID: ${response.sid}`);
  } catch (error) {
    console.error("❌ Erro ao enviar WhatsApp via Twilio:", error.message);
  }
}

module.exports = { enviarMensagem };