import { HttpResponse } from 'msw';

type ProblemExtensions = { field?: string; code?: string; minutesRemaining?: number };

/** Erro como a API responde: `ProblemDetails`, com as extensões que o front lê no topo do corpo. */
export function problemResponse(status: number, extensions: ProblemExtensions = {}) {
  return HttpResponse.json(
    { type: 'about:blank', title: 'Error', status, detail: 'Mensagem da API.', ...extensions },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}
