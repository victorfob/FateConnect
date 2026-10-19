import type { SelectOption } from '@design-system';

import { SELECT_PLACEHOLDER } from '@app/constants/selectPlaceholder';
import { REPORT_CATEGORY_OPTIONS } from '@app/pages/Reports/helpers/reportCategory';

/** Limites do `CreateReportDto` e da entidade `Report`, espelhados no front. */
export const REPORT_LIMITS = {
  minDescription: 10,
  maxDescription: 500,
};

export const REPORT_FORM = {
  title: 'Enviar denúncia',
  submitLabel: 'Enviar denúncia',
  succeeded: 'Denúncia enviada.',
  failed: 'Erro ao enviar a denúncia. Tente novamente.',
};

/**
 * Responde a dúvida de quem está com o diálogo aberto — se o caso vale aqui — e
 * garante que nada é automático. ⛔ As medidas possíveis ficam de fora: elas já
 * estão no §8 dos termos, e no momento de denunciar elas pesam em vez de informar.
 */
export const CHANNEL_NOTE =
  'Vale para condutas que desrespeitam as regras da plataforma, dentro ou fora dela. Cada denúncia é analisada antes de qualquer medida.';

export const REPORT_FORM_LABELS = {
  confidential: 'Sigilosa',
  category: 'Motivo',
  description: 'Descrição',
  photo: 'Foto',
};

/**
 * Sigilo não é anonimato: a identidade existe e o que a esconde é o controle de
 * acesso. O motivo do vínculo entra junto, porque limite sem porquê se lê como
 * arbitrário.
 */
export const CONFIDENTIAL_HINT =
  'A denúncia continua ligada à sua conta, o que permite apurar uso indevido do canal. Quem analisa não recebe os seus dados.';

export const FORCED_SECRECY_NOTE =
  'Sem telefone e e-mail para contato, a denúncia sai sigilosa: quem analisa não recebe os seus dados, mas ela continua ligada à sua conta, o que permite apurar uso indevido do canal. Para enviar sem sigilo, cadastre os contatos em Meu perfil.';

export const REPORT_FORM_PLACEHOLDERS = {
  description: 'Conte o que aconteceu, com data e local',
};

export const DESCRIPTION_ROWS = 4;

const EMPTY_CHOICE: SelectOption = { value: '', label: SELECT_PLACEHOLDER };

/** As escolhas do campo, já com a opção vazia na frente. */
export const REPORT_CATEGORY_SELECT_OPTIONS: readonly SelectOption[] = [
  EMPTY_CHOICE,
  ...REPORT_CATEGORY_OPTIONS,
];

export const REPORT_FORM_MESSAGES = {
  categoryRequired: 'Selecione o motivo',
  descriptionTooShort: `A descrição deve ter ao menos ${REPORT_LIMITS.minDescription} caracteres`,
  descriptionTooLong: `A descrição pode ter no máximo ${REPORT_LIMITS.maxDescription} caracteres`,
};
