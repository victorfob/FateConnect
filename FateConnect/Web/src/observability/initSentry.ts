import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router';
import { init, reactRouterBrowserTracingIntegration, replayIntegration } from '@sentry/react';

const TRACES_SAMPLE_RATE = 1;
const REPLAY_SESSION_SAMPLE_RATE = 0.1;
const REPLAY_ON_ERROR_SAMPLE_RATE = 1;

/** Só nas nossas APIs o cabeçalho de rastro é propagado. */
function tracePropagationTargets(): string[] {
  const apis = [import.meta.env.VITE_API_URL, import.meta.env.VITE_RIDE_API_URL];

  return ['localhost', ...apis.filter(Boolean)];
}

/**
 * Sem DSN o SDK não sobe. É o que mantém desenvolvimento e teste sem enviar
 * nada, e o que permite trocar de projeto sem tocar em código.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      reactRouterBrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    tracesSampleRate: TRACES_SAMPLE_RATE,
    tracePropagationTargets: tracePropagationTargets(),
    replaysSessionSampleRate: REPLAY_SESSION_SAMPLE_RATE,
    replaysOnErrorSampleRate: REPLAY_ON_ERROR_SAMPLE_RATE,
    // O cadastro envia senha, e-mail e endereço: nenhum corpo de requisição e
    // nenhum dado de usuário sai do navegador.
    dataCollection: { userInfo: false, httpBodies: [] },
    // `enableLogs` vem `true` do SDK; o repo não tem console em produção.
    enableLogs: false,
  });
}
