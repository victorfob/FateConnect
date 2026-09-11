/**
 * Domínio institucional que a API exige no cadastro e no login. O mesmo par de
 * padrões está nos dois DTOs do back; recusar aqui evita disparar requisição
 * fadada a voltar 400 com mensagem genérica.
 */
export const FATEC_EMAIL_DOMAIN_PATTERN = /^.*@(aluno\.)?cps\.sp\.gov\.br$/;

/** Um `@` só, e antes dele o que a API aceita — é aqui que o acento reprova. */
export const FATEC_EMAIL_LOCAL_PART_PATTERN = /^[a-zA-Z0-9._%+-]+@[^@]*$/;

export const FATEC_EMAIL_DOMAIN_MESSAGE = 'Use o e-mail @aluno.cps.sp.gov.br ou @cps.sp.gov.br';

export const FATEC_EMAIL_LOCAL_PART_MESSAGE =
  'Use o e-mail sem acento nem espaço, como a Fatec emitiu';
