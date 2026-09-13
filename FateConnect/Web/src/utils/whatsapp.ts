import { internationalPhoneDigits } from './phone';

const CONVERSATION_URL = 'https://wa.me';

/**
 * Conversa no WhatsApp com o número e a mensagem já escrita. O `wa.me` recusa
 * qualquer separador, então parênteses, espaço e hífen do telefone exibido caem
 * fora antes de montar o endereço.
 */
export function whatsappConversationUrl(phone: string, message: string): string {
  const text = encodeURIComponent(message);

  return `${CONVERSATION_URL}/${internationalPhoneDigits(phone)}?text=${text}`;
}
