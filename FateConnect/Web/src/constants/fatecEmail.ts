/**
 * Domínio institucional que a API exige no cadastro e no login. O mesmo padrão
 * está nos dois DTOs do back; recusar aqui evita disparar requisição fadada a
 * voltar 400 com mensagem genérica.
 */
export const FATEC_EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@(aluno\.)?cps\.sp\.gov\.br$/;

export const FATEC_EMAIL_MESSAGE = 'Use o e-mail @aluno.cps.sp.gov.br ou @cps.sp.gov.br';
