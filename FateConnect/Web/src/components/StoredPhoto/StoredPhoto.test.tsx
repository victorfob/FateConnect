import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { DOWNLOAD_FAILED_MESSAGE } from './constants';
import { StoredPhoto, type StoredPhotoProps } from '.';

const PHOTO_ALT = 'Foto de Carteira preta';
const STORED_PATH = 'uploads/lostandfound/6f0b8e3a-1c2d-4e5f-8a9b-0c1d2e3f4a5b.png';
const STORED_URL = `https://api.fateconnect.test/${STORED_PATH}`;
const OBJECT_URL = 'blob:https://fateconnect.test/foto';
/** Basta ser corpo binário: o que a tela usa é o blob que o cliente devolve. */
const PNG_BYTES = '\x89PNG\r\n\x1a\n';

const SERVER_ERROR = 500;

const ORIGINAL_PATH = 'Denunciations/a1f0/image';
const ORIGINAL_URL = `https://api.fateconnect.test/${ORIGINAL_PATH}`;

const DOWNLOAD = { label: 'Baixar a foto', baseName: 'denuncia', originalUrl: ORIGINAL_PATH };

const DEFAULT_PROPS: StoredPhotoProps = { url: STORED_PATH, alt: PHOTO_ALT };

const renderComponent = (props = DEFAULT_PROPS) => render(<StoredPhoto {...props} />);

const photo = () => screen.queryByRole('img', { name: PHOTO_ALT });

function storedImageServing(onRequest?: (request: Request) => void, contentType = 'image/png') {
  server.use(
    http.get(STORED_URL, ({ request }) => {
      onRequest?.(request);

      return new HttpResponse(PNG_BYTES, { headers: { 'Content-Type': contentType } });
    }),
  );
}

function originalServing(onRequest?: VoidFunction, contentType = 'image/png') {
  server.use(
    http.get(ORIGINAL_URL, () => {
      onRequest?.();

      return new HttpResponse(PNG_BYTES, { headers: { 'Content-Type': contentType } });
    }),
  );
}

function downloadsCaptured(): { href: string; download: string }[] {
  const clicked: { href: string; download: string }[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    clicked.push({ href: this.href, download: this.download });
  });

  return clicked;
}

describe('StoredPhoto', () => {
  beforeEach(() => {
    // jsdom não implementa a fábrica de URL de objeto, e é dela que sai a foto.
    URL.createObjectURL = vi.fn(() => OBJECT_URL);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    tokenStorage.clear();
    vi.restoreAllMocks();
  });

  it('should keep the drawn placeholder when there is no photo', async () => {
    let asked = false;
    storedImageServing(() => {
      asked = true;
    });

    renderComponent({ ...DEFAULT_PROPS, url: null });

    expect(photo()).not.toBeInTheDocument();
    await waitFor(() => expect(asked).toBe(false));
  });

  // Uma `<img>` apontada para o endereço guardado não manda cabeçalho nenhum e
  // recebe 401, então o que a tela exibe é o resultado da busca com o token.
  it('should fetch the photo carrying the session token', async () => {
    const token = tokenWithName('Maria da Silva');
    tokenStorage.save(token);
    let authorization: string | null = null;
    storedImageServing((request) => {
      authorization = request.headers.get('Authorization');
    });

    renderComponent();

    await waitFor(() => expect(photo()).toBeInTheDocument());
    expect(authorization).toBe(`Bearer ${token}`);
    expect(photo()).toHaveAttribute('src', OBJECT_URL);
  });

  it('should keep the placeholder when the api refuses the photo', async () => {
    server.use(http.get(STORED_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));

    renderComponent();

    await waitFor(() => expect(URL.createObjectURL).not.toHaveBeenCalled());
    expect(photo()).not.toBeInTheDocument();
  });

  it('should not show the photo of the previous item while the next is on its way', async () => {
    storedImageServing();
    const OTHER_PATH = 'uploads/lostandfound/1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d.png';
    server.use(
      http.get(`https://api.fateconnect.test/${OTHER_PATH}`, () => {
        return new HttpResponse(null, { status: SERVER_ERROR });
      }),
    );
    const { rerender } = renderComponent();
    await waitFor(() => expect(photo()).toBeInTheDocument());

    rerender(<StoredPhoto url={OTHER_PATH} alt={PHOTO_ALT} />);

    expect(photo()).not.toBeInTheDocument();
  });

  it('should give the object url back when the card leaves the screen', async () => {
    storedImageServing();
    const { unmount } = renderComponent();
    await waitFor(() => expect(photo()).toBeInTheDocument());

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(OBJECT_URL);
  });

  it('should offer no trigger when no download is asked for', async () => {
    storedImageServing();

    renderComponent();

    await waitFor(() => expect(photo()).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: DOWNLOAD.label })).not.toBeInTheDocument();
  });

  it('should fetch the original only when the trigger is used, and hand it to the browser', async () => {
    storedImageServing();
    let originalRequests = 0;
    originalServing(() => {
      originalRequests += 1;
    });
    const clicked = downloadsCaptured();

    renderComponent({ ...DEFAULT_PROPS, download: DOWNLOAD });
    await waitFor(() => expect(photo()).toBeInTheDocument());

    expect(originalRequests).toBe(0);

    await userEvent.click(screen.getByRole('button', { name: DOWNLOAD.label }));

    await waitFor(() => expect(clicked).toEqual([{ href: OBJECT_URL, download: 'denuncia.png' }]));
    expect(originalRequests).toBe(1);
  });

  // O endereço da foto de denúncia termina em `/image`, sem sufixo nenhum: quem
  // diz o formato é a resposta, e o nome baixado precisa segui-la.
  it('should take the downloaded extension from the served content type', async () => {
    storedImageServing();
    originalServing(undefined, 'image/webp');
    const clicked = downloadsCaptured();

    renderComponent({ ...DEFAULT_PROPS, download: DOWNLOAD });
    await waitFor(() => expect(photo()).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: DOWNLOAD.label }));

    await waitFor(() => expect(clicked).toEqual([{ href: OBJECT_URL, download: 'denuncia.webp' }]));
  });

  it('should download without extension when the served type is unknown', async () => {
    storedImageServing();
    originalServing(undefined, 'application/octet-stream');
    const clicked = downloadsCaptured();

    renderComponent({ ...DEFAULT_PROPS, download: DOWNLOAD });
    await waitFor(() => expect(photo()).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: DOWNLOAD.label }));

    await waitFor(() =>
      expect(clicked).toEqual([{ href: OBJECT_URL, download: DOWNLOAD.baseName }]),
    );
  });

  it('should say so when the original cannot be fetched, handing nothing to the browser', async () => {
    storedImageServing();
    server.use(http.get(ORIGINAL_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    const clicked = downloadsCaptured();

    renderComponent({ ...DEFAULT_PROPS, download: DOWNLOAD });
    await waitFor(() => expect(photo()).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: DOWNLOAD.label }));

    expect(await screen.findByText(DOWNLOAD_FAILED_MESSAGE)).toBeInTheDocument();
    expect(clicked).toEqual([]);
  });
});
