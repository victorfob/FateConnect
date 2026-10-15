import { stripUrlQueries } from './stripUrlQueries';

const LINK =
  'https://hml.fateconnect.test/confirmar-email?token=abc123&email=aluna%40fatec.sp.gov.br';

describe('stripUrlQueries', () => {
  it('should drop the query of absolute urls, paths and bare queries at any depth', () => {
    const event = {
      request: { url: LINK },
      breadcrumbs: [{ data: { from: '/redefinir-senha?token=abc123', to: '/entrar' } }],
      spans: [{ description: `GET ${LINK}`, data: { from: '?token=abc123' } }],
    };

    expect(stripUrlQueries(event)).toEqual({
      request: { url: 'https://hml.fateconnect.test/confirmar-email' },
      breadcrumbs: [{ data: { from: '/redefinir-senha', to: '/entrar' } }],
      spans: [
        {
          description: 'GET https://hml.fateconnect.test/confirmar-email',
          data: { from: '' },
        },
      ],
    });
  });

  it('should drop the query a span keeps apart from the url, without the question mark', () => {
    const span = {
      name: `GET ${LINK}`,
      attributes: {
        'url.full': LINK,
        'url.query': 'token=abc123&email=aluna%40fatec.sp.gov.br',
        'http.query': '?token=abc123',
        'http.request.method': 'GET',
      },
    };

    expect(stripUrlQueries(span)).toEqual({
      name: 'GET https://hml.fateconnect.test/confirmar-email',
      attributes: {
        'url.full': 'https://hml.fateconnect.test/confirmar-email',
        'http.request.method': 'GET',
      },
    });
  });

  it('should keep text that only ends in a question mark', () => {
    const breadcrumb = { message: 'Deseja sair da conta?', category: 'ui.click' };

    expect(stripUrlQueries(breadcrumb)).toEqual({
      message: 'Deseja sair da conta?',
      category: 'ui.click',
    });
  });

  it('should walk a payload that points back to itself without looping', () => {
    const recording: { href: string; self?: unknown } = { href: LINK };
    recording.self = recording;

    expect(stripUrlQueries(recording).href).toBe('https://hml.fateconnect.test/confirmar-email');
  });
});
