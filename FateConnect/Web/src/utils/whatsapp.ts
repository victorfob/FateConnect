const CONVERSATION_URL = 'https://wa.me';

/**
 * Código do Brasil. Os telefones do cadastro vêm com DDD e sem código de país,
 * e o `wa.me` só entende o número em formato internacional.
 */
const COUNTRY_CODE = '55';

const NON_DIGIT = /\D/g;

/**
 * Conversa no WhatsApp com o número e a mensagem já escrita. O `wa.me` recusa
 * qualquer separador, então parênteses, espaço e hífen do telefone exibido caem
 * fora antes de montar o endereço.
 */
export function whatsappConversationUrl(phone: string, message: string): string {
  const digits = phone.replace(NON_DIGIT, '');
  const text = encodeURIComponent(message);

  return `${CONVERSATION_URL}/${COUNTRY_CODE}${digits}?text=${text}`;
}
