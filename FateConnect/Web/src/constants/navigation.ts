import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';

export type LandingLink = { section: LandingSectionEnum; label: string; highlighted: boolean };
export type AppLink = { path: RoutePathEnum; label: string };

export const LANDING_LINKS: LandingLink[] = [
  { section: LandingSectionEnum.SERVICES, label: 'Serviços', highlighted: false },
  { section: LandingSectionEnum.HOW_IT_WORKS, label: 'Como funciona', highlighted: false },
  { section: LandingSectionEnum.CONTACT, label: 'Entre em contato', highlighted: false },
  { section: LandingSectionEnum.LOGIN, label: 'Entrar', highlighted: true },
];

/**
 * Navegação da área logada. Sem "Entre em Contato": a tela de contato existe
 * como âncora na landing, não como rota de quem já entrou.
 */
export const APP_LINKS: AppLink[] = [
  { path: RoutePathEnum.LOST_AND_FOUND, label: 'Achados & Perdidos' },
  { path: RoutePathEnum.RIDES, label: 'Caronas' },
];
