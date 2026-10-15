import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router';
import { init, reactRouterBrowserTracingIntegration, type BrowserOptions } from '@sentry/react';

import { scheduleSessionReplay } from './loadSessionReplay';
import { stripUrlQueries } from './stripUrlQueries';
import { syncSentryUser } from './syncSentryUser';

const TRACES_SAMPLE_RATE = 1;
const REPLAY_SESSION_SAMPLE_RATE = 0.1;
const REPLAY_ON_ERROR_SAMPLE_RATE = 1;

/**
 * Do navegador vão só a identificação dele e a página de origem, que dizem onde a
 * falha acontece. Senha e dados pessoais viajam no corpo das requisições, e a
 * conta é identificada pelo e-mail do token, nunca pelo IP.
 */
const DATA_COLLECTION: BrowserOptions['dataCollection'] = {
  userInfo: false,
  cookies: false,
  httpHeaders: { request: true, response: false },
  httpBodies: [],
  urlQueryParams: false,
  graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  stackFrameVariables: false,
};

/**
 * `MODE` responde `production` em qualquer `vite build`, então é a variável que
 * separa homologação de produção — sem ela os dois relatam o mesmo ambiente.
 */
function environmentName(): string {
  const declared = import.meta.env.VITE_SENTRY_ENVIRONMENT;
  if (!declared) return import.meta.env.MODE;

  return declared;
}

/** Só nas nossas APIs o cabeçalho de rastro é propagado. */
function tracePropagationTargets(): string[] {
  const apis = [import.meta.env.VITE_API_URL];

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
    environment: environmentName(),
    integrations: [
      reactRouterBrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      { name: 'StripUrlQueries', processEvent: stripUrlQueries },
    ],
    beforeBreadcrumb: stripUrlQueries,
    beforeSendSpan: stripUrlQueries,
    tracesSampleRate: TRACES_SAMPLE_RATE,
    tracePropagationTargets: tracePropagationTargets(),
    replaysSessionSampleRate: REPLAY_SESSION_SAMPLE_RATE,
    replaysOnErrorSampleRate: REPLAY_ON_ERROR_SAMPLE_RATE,
    dataCollection: DATA_COLLECTION,
  });

  syncSentryUser();
  scheduleSessionReplay();
}
