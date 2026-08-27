import { tokenStorage } from '@app/services/auth/tokenStorage';

export type RideDriver = { name: string; email: string; phone: string };

/**
 * Quem ofertou a carona.
 *
 * **Provisório e igual para toda carona.** A API de caronas não guarda o dono —
 * a entidade não tem usuário e o backend só expõe login e cadastro —, então não
 * há de onde ler o contato de quem ofertou. Estes valores são fictícios, para o
 * fluxo ficar navegável; quando a resposta trouxer o motorista, é aqui que a
 * leitura passa a acontecer e o resto do caminho continua igual.
 */
export const RIDE_DRIVER: RideDriver = {
  name: 'Motorista de Exemplo',
  email: 'contato@example.com',
  phone: '(15) 90000-0000',
};

/**
 * A carona é minha quando quem ofertou é quem está logado — é o que tira o
 * contato do próprio cartão, já que não há por que eu me contatar.
 *
 * A comparação é por nome porque é o único dado da pessoa que o login guarda.
 * Enquanto o motorista acima é fictício, nenhuma carona cai neste caso: a regra
 * fica no lugar para quando o dono real chegar.
 */
export function isOwnRide(driver: RideDriver): boolean {
  return driver.name === tokenStorage.getUserName();
}
