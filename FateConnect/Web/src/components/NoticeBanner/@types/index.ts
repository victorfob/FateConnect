import type { To } from 'react-router';

/** A ação da faixa leva a outra tela ou faz algo ali mesmo. */
export type NoticeBannerAction = { label: string } & ({ to: To } | { onClick: VoidFunction });
