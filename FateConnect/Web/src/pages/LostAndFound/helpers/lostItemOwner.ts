export type LostItemOwner = { name: string; email: string; phone: string };

/** Provisório e fictício: a API ainda não devolve quem cadastrou o item. */
export const LOST_ITEM_OWNER: LostItemOwner = {
  name: 'Pessoa de Exemplo',
  email: 'contato@example.com',
  phone: '(15) 90000-0000',
};
