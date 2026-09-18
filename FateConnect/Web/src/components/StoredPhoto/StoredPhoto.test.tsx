import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { StoredPhoto, type StoredPhotoProps } from '.';

const PHOTO_ALT = 'Foto de Carteira preta';
const STORED_PATH = 'uploads/lostandfound/6f0b8e3a-1c2d-4e5f-8a9b-0c1d2e3f4a5b.png';
const STORED_URL = `https://api.fateconnect.test/${STORED_PATH}`;
const OBJECT_URL = 'blob:https://fateconnect.test/foto';
/** Basta ser corpo binário: o que a tela usa é o blob que o cliente devolve. */
const PNG_BYTES = '\x89PNG\r\n\x1a\n';

const SERVER_ERROR = 500;

const DOWNLOAD = { label: 'Baixar a foto', fileName: 'denuncia.png' };

const DEFAULT_PROPS: StoredPhotoProps = { url: STORED_PATH, alt: PHOTO_ALT };

const renderComponent = (props = DEFAULT_PROPS) => render(<StoredPhoto {...props} />);

const photo = () => screen.queryByRole('img', { name: PHOTO_ALT });

function storedImageServing(onRequest?: (request: Request) => void) {
  server.use(
    http.get(STORED_URL, ({ request }) => {
      onRequest?.(request);

      return new HttpResponse(PNG_BYTES, { headers: { 'Content-Type': 'image/png' } });
    }),
  );
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

  it('should hand the loaded photo to the browser when the trigger is used', async () => {
    storedImageServing();
    const clicked: { href: string; download: string }[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push({ href: this.href, download: this.download });
    });

    renderComponent({ ...DEFAULT_PROPS, download: DOWNLOAD });
    await waitFor(() => expect(photo()).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: DOWNLOAD.label }));

    expect(clicked).toEqual([{ href: OBJECT_URL, download: DOWNLOAD.fileName }]);
  });
});
