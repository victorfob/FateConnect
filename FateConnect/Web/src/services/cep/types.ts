/**
 * Endereço devolvido pelos provedores de CEP. O provedor primário responde
 * `200` com `{ erro: "true" }` quando o CEP não existe — daí o campo opcional.
 */
export type CepAddress = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: string;
};
