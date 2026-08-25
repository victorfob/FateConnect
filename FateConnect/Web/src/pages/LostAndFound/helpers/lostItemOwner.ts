export type LostItemOwner = { name: string; email: string; phone: string };

/**
 * Quem cadastrou o item.
 *
 * **Provisório e igual para todo item.** O contrato só diz se o item é meu
 * (`meuItem`), não de quem ele é — a API ainda não devolve quem cadastrou —,
 * então não há de onde ler o contato. Estes valores são fictícios, para o fluxo
 * ficar navegável; quando a resposta trouxer quem cadastrou, é aqui que a
 * leitura passa a acontecer e o resto do caminho continua igual.
 */
export const LOST_ITEM_OWNER: LostItemOwner = {
  name: 'Pessoa de Exemplo',
  email: 'contato@example.com',
  phone: '(15) 90000-0000',
};
