import { createMemoryRouter, RouterProvider } from 'react-router';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PAGE_METADATA } from '@app/routes/pageMetadata';
import { RoutePathEnum } from '@app/routes/paths';
import { render, waitFor } from '@app/test/testing-library';
import { createAppTheme } from '@ds-root/theme';

import { PageMetadata } from '.';

const UNKNOWN_PATH = '/rota-que-nao-existe';

const RENDERED_ROUTES = Object.values(RoutePathEnum);

const WEB_ROOT = resolve(import.meta.dirname, '../../..');

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const IHDR_TYPE_OFFSET = 12;
const IHDR_WIDTH_OFFSET = 16;
const IHDR_HEIGHT_OFFSET = 20;

const MANIFEST_HREF = '/manifest.webmanifest';
const LIGHT_CHROME = createAppTheme('light').palette.chrome.main;
const DARK_CHROME = createAppTheme('dark').palette.chrome.main;
const APPLE_TOUCH_ICON_SIZE = '180x180';

type ManifestIcon = Readonly<{ src: string; sizes: string; type: string; purpose: string }>;

type ManifestScreenshot = Readonly<{
  src: string;
  sizes: string;
  type: string;
  form_factor: string;
}>;

type WebAppManifest = Readonly<{
  id: string;
  name: string;
  short_name: string;
  description: string;
  lang: string;
  start_url: string;
  scope: string;
  display: string;
  theme_color: string;
  background_color: string;
  icons: ManifestIcon[];
  screenshots: ManifestScreenshot[];
}>;

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
  return readFileSync(resolve(WEB_ROOT, 'index.html'), 'utf8');
}

function indexHead() {
  return new DOMParser().parseFromString(indexHtml(), 'text/html').head;
}

function headLink(rel: string) {
  return indexHead().querySelector(`link[rel="${rel}"]`)?.getAttribute('href') ?? '';
}

function publicFileServedAt(href: string) {
  return resolve(WEB_ROOT, 'public', href.replace(/^\//, ''));
}

function manifest(): WebAppManifest {
  return JSON.parse(readFileSync(publicFileServedAt(MANIFEST_HREF), 'utf8'));
}

function pngSize(href: string) {
  const bytes = readFileSync(publicFileServedAt(href));

  expect(bytes.subarray(0, PNG_SIGNATURE.length)).toEqual(PNG_SIGNATURE);
  expect(bytes.toString('ascii', IHDR_TYPE_OFFSET, IHDR_WIDTH_OFFSET)).toBe('IHDR');

  return `${bytes.readUInt32BE(IHDR_WIDTH_OFFSET)}x${bytes.readUInt32BE(IHDR_HEIGHT_OFFSET)}`;
}

function themeColorFor(scheme: 'light' | 'dark') {
  return indexHead()
    .querySelector(`meta[name="theme-color"][media="(prefers-color-scheme: ${scheme})"]`)
    ?.getAttribute('content');
}

function iconSizes(purpose: string) {
  return manifest()
    .icons.filter((icon) => icon.purpose === purpose)
    .map((icon) => icon.sizes);
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

  // O Lighthouse reprova canonical relativa. Afirmar a origem montada repetiria
  // a implementação, então o que se afirma é que o endereço se resolve sem base.
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
   * ⛔ O React insere `<title>` no começo do `<head>` e `<meta>` no fim: uma
   * description estática venceria a da rota. O jsdom não carrega o `index.html`,
   * então só este caso guarda a assimetria.
   */
  it('should keep a static description out of index.html, which would outrank the route one', () => {
    expect(indexHtml()).not.toContain('name="description"');
  });
});

describe('web app manifest', () => {
  it('should link a manifest that exists in public', () => {
    expect(headLink('manifest')).toBe(MANIFEST_HREF);
    expect(existsSync(publicFileServedAt(MANIFEST_HREF))).toBe(true);
  });

  it('should declare what the browser requires to offer the install', () => {
    expect(manifest()).toMatchObject({
      id: RoutePathEnum.LANDING,
      name: 'FateConnect',
      short_name: 'FateConnect',
      lang: 'pt-BR',
      start_url: RoutePathEnum.LANDING,
      scope: RoutePathEnum.LANDING,
      display: 'standalone',
    });
    expect(iconSizes('any')).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(iconSizes('maskable')).toContain('512x512');
  });

  it('should describe the app with the landing description', () => {
    expect(manifest().description).toBe(PAGE_METADATA[RoutePathEnum.LANDING].description);
  });

  it.each(manifest().icons.map((icon) => [icon.src, icon]))(
    'should ship %s as a PNG of the declared size',
    (_src, icon) => {
      expect(icon.type).toBe('image/png');
      expect(pngSize(icon.src)).toBe(icon.sizes);
    },
  );

  it('should show the install with one wide and one narrow screenshot', () => {
    expect(manifest().screenshots.map((screenshot) => screenshot.form_factor)).toEqual([
      'wide',
      'narrow',
    ]);
  });

  it.each(manifest().screenshots.map((screenshot) => [screenshot.src, screenshot]))(
    'should ship %s as a PNG of the declared size',
    (_src, screenshot) => {
      expect(screenshot.type).toBe('image/png');
      expect(pngSize(screenshot.src)).toBe(screenshot.sizes);
    },
  );

  // O Safari do iPhone prefere este ícone ao do manifesto e não aplica o `maskable`.
  it('should link a square apple-touch-icon for the iPhone home screen', () => {
    expect(pngSize(headLink('apple-touch-icon'))).toBe(APPLE_TOUCH_ICON_SIZE);
  });

  // O ícone tem o corpo branco do topo, que sumiria sobre o fundo claro da página.
  it('should open the installed app on the light chrome, whatever the theme', () => {
    expect(manifest().theme_color).toBe(LIGHT_CHROME);
    expect(manifest().background_color).toBe(LIGHT_CHROME);
  });

  it('should paint the browser bar with the chrome of the device scheme until the app opens', () => {
    expect(themeColorFor('light')).toBe(LIGHT_CHROME);
    expect(themeColorFor('dark')).toBe(DARK_CHROME);
  });
});
