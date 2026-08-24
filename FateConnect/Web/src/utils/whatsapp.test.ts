import { whatsappConversationUrl } from './whatsapp';

describe('whatsappConversationUrl', () => {
  it('should keep only the digits of the phone and add the country code', () => {
    expect(whatsappConversationUrl('(15) 98115-5018', 'Oi')).toContain(
      'https://wa.me/5515981155018',
    );
  });

  it('should escape the message so it survives the query string', () => {
    const url = whatsappConversationUrl('(15) 90000-0000', 'Olá! Ainda tem vaga?');

    expect(url).toBe('https://wa.me/5515900000000?text=Ol%C3%A1!%20Ainda%20tem%20vaga%3F');
  });
});
