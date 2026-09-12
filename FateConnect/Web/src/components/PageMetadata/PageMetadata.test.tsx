import { createMemoryRouter, RouterProvider } from 'react-router';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PAGE_METADATA } from '@app/routes/pageMetadata';
import { RoutePathEnum } from '@app/routes/paths';
import { render, waitFor } from '@app/test/testing-library';

import { PageMetadata } from '.';

const UNKNOWN_PATH = '/rota-que-nao-existe';

/** Sem a raiz, que só redireciona e herda a landing de propósito. */
const RENDERED_ROUTES = Object.values(RoutePathEnum).filter((path) => path !== RoutePathEnum.ROOT);

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: '*', element: <PageMetadata /> }], {
    initialEntries: [path],
  });

  return render(<RouterProvider router={router} />);
}

function headTitle() {
  return document.head.querySelector('title')?.textContent ?? null;
}

function headContent(selector: string) {
  return document.head.querySelector(selector)?.getAttribute('content') ?? null;
}

function indexHtml() {
  return readFileSync(resolve(import.meta.dirname, '../../../index.html'), 'utf8');
}

describe('PageMetadata', () => {
  it('should give every rendered route a distinct title', () => {
    const titles = RENDERED_ROUTES.map((path) => PAGE_METADATA[path].title);

    expect(new Set(titles).size).toBe(RENDERED_ROUTES.length);
  });

  // O título é da rota e não da tela: as três abaixo compartilham o mesmo
  // componente hoje, e trocá-lo pela tela real não pode perder o título.
  it.each([
    [RoutePathEnum.PROFILE, 'Meu perfil'],
    [RoutePathEnum.DENUNCIATIONS, 'Denúncias'],
    [RoutePathEnum.NOTIFICATIONS, 'Notificações'],
  ])('should name %s by its destination, not by the placeholder screen', (path, screen) => {
    expect(PAGE_METADATA[path].title).toContain(screen);
  });

  it('should describe only the public routes', () => {
    const described = RENDERED_ROUTES.filter((path) => PAGE_METADATA[path].description);

    expect(described).toEqual([RoutePathEnum.LANDING, RoutePathEnum.SIGNUP]);
  });

  it('should store the canonical as a path, leaving the origin to the environment', () => {
    expect(PAGE_METADATA[RoutePathEnum.LANDING].canonical).toBe(RoutePathEnum.LANDING);
  });

  it('should let the root inherit the landing, so the redirect shows no other title', () => {
    expect(PAGE_METADATA[RoutePathEnum.ROOT]).toBe(PAGE_METADATA[RoutePathEnum.LANDING]);
  });

  it('should write the title of the current route into the document head', async () => {
    renderAt(RoutePathEnum.RIDES);

    await waitFor(() => expect(headTitle()).toBe(PAGE_METADATA[RoutePathEnum.RIDES].title));
  });

  it('should write description and canonical on the landing', async () => {
    renderAt(RoutePathEnum.LANDING);

    await waitFor(() =>
      expect(headContent('meta[name="description"]')).toBe(
        PAGE_METADATA[RoutePathEnum.LANDING].description,
      ),
    );
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${window.location.origin}${RoutePathEnum.LANDING}`,
    );
  });

  // O Lighthouse reprova canonical relativa com nota zero, e foi assim que ela
  // saiu: afirmar a origem montada repetiria a implementação, então o que se
  // afirma aqui é que o endereço se resolve sozinho, sem base.
  it('should render a canonical that is absolute on its own', async () => {
    renderAt(RoutePathEnum.LANDING);

    await waitFor(() =>
      expect(document.head.querySelector('link[rel="canonical"]')).not.toBeNull(),
    );
    const href = document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';

    expect(() => new URL(href)).not.toThrow();
    expect(href.startsWith('/')).toBe(false);
  });

  // A rota interna não é alcançada por robô: descrição ali seria texto sem leitor.
  it('should leave description and canonical out of an internal route', async () => {
    renderAt(RoutePathEnum.PREFERENCES);

    await waitFor(() => expect(headTitle()).toBe(PAGE_METADATA[RoutePathEnum.PREFERENCES].title));
    expect(headContent('meta[name="description"]')).toBeNull();
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('should fall back to the landing on a path it does not know', async () => {
    renderAt(UNKNOWN_PATH);

    await waitFor(() => expect(headTitle()).toBe(PAGE_METADATA[RoutePathEnum.LANDING].title));
  });

  // ⛔ O index.html repete o título da landing porque é ele que a primeira
  // passada do rastreador lê. Sem este caso os dois divergem sem nada acusar.
  it('should keep the index.html default title equal to the landing title', () => {
    expect(indexHtml()).toContain(`<title>${PAGE_METADATA[RoutePathEnum.LANDING].title}</title>`);
  });

  /**
   * ⛔ Medido no navegador: o React insere `<title>` no começo do `<head>` e
   * `<meta>` no fim. Uma description estática ficaria à frente da que a rota
   * declara e venceria — `/cadastro` serviria o texto da landing. O jsdom não
   * carrega o `index.html`, então só este caso guarda a assimetria.
   */
  it('should keep a static description out of index.html, which would outrank the route one', () => {
    expect(indexHtml()).not.toContain('name="description"');
  });
});
