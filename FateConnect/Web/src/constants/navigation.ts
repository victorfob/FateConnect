import { LandingSection, RoutePath } from '@app/routes/paths';

export type LandingLink = { section: LandingSection; label: string; highlighted: boolean };
export type AppLink = { path: RoutePath; label: string };

/** Navegação da landing: rola até a seção correspondente. */
export const LANDING_LINKS: LandingLink[] = [
  { section: LandingSection.SERVICES, label: 'Serviços', highlighted: false },
  { section: LandingSection.HOW_IT_WORKS, label: 'Como Funciona', highlighted: false },
  { section: LandingSection.CONTACT, label: 'Entre em Contato', highlighted: false },
  { section: LandingSection.LOGIN, label: 'Entrar', highlighted: true },
];

/**
 * Navegação da área logada. Sem "Entre em Contato": a tela de contato existe
 * como âncora na landing, não como rota de quem já entrou.
 */
export const APP_LINKS: AppLink[] = [
  { path: RoutePath.LOST_AND_FOUND, label: 'Achados & Perdidos' },
  { path: RoutePath.RIDES, label: 'Caronas' },
];
