import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import type { UserContact } from '@app/services/types';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';

import { CONTACT_LABEL } from './constants';
import { sendEmailLabel } from './ContactDetails/constants';
import { ContactButton } from '.';

const EMAIL = 'mariana.nogueira.souza@example.com';

/**
 * Nome de cinco palavras e e-mail longo: é o caso que quebra a linha. O
 * telefone vem cru, como a API o devolve.
 */
const CONTACT: UserContact = {
  name: 'Mariana Aparecida de Souza Nogueira',
  email: EMAIL,
  phone: '15900000000',
  thumbnailUrl: null,
};

const MESSAGE = 'Olá';

const THUMBNAIL_PATH = 'uploads/user/thumbnails/perfil.webp';
const THUMBNAIL_URL = `https://api.fateconnect.test/${THUMBNAIL_PATH}`;
const OBJECT_URL = 'blob:https://fateconnect.test/perfil';
/** Basta ser corpo binário: o que a tela usa é o blob que o cliente devolve. */
const WEBP_BYTES = 'RIFF\0\0\0\0WEBP';
const SERVER_ERROR = 500;
const INITIALS = 'MN';

const CONTACT_WITH_PHOTO: UserContact = { ...CONTACT, thumbnailUrl: THUMBNAIL_PATH };

const DEFAULT_PROPS = { contact: CONTACT, message: MESSAGE };

const renderComponent = (props = DEFAULT_PROPS) => render(<ContactButton {...props} />);

function thumbnailAnswering(onRequest: VoidFunction, status = 200) {
  server.use(
    http.get(THUMBNAIL_URL, () => {
      onRequest();
      if (status !== 200) return new HttpResponse(null, { status });

      return new HttpResponse(WEBP_BYTES, { headers: { 'Content-Type': 'image/webp' } });
    }),
  );
}

async function openDialog() {
  await userEvent.click(screen.getByRole('button', { name: CONTACT_LABEL }));

  return within(await screen.findByRole('dialog'));
}

describe('ContactButton', () => {
  beforeEach(() => {
    // jsdom não implementa a fábrica de URL de objeto, e é dela que sai a foto.
    URL.createObjectURL = vi.fn(() => OBJECT_URL);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show the phone masked while the conversation link keeps the raw digits', async () => {
    renderComponent();

    const dialog = await openDialog();
    const phoneLink = dialog.getByRole('link', { name: '(15) 90000-0000' });

    expect(phoneLink).toHaveAttribute('href', 'https://wa.me/5515900000000?text=Ol%C3%A1');
    // A máscara não pode vazar para o endereço: separador quebra a conversa.
    expect(phoneLink.getAttribute('href')).not.toMatch(/[()\s-]/);
  });

  it('should show a long name in full, without cutting it', async () => {
    renderComponent();

    const dialog = await openDialog();

    expect(dialog.getByText(CONTACT.name)).toBeInTheDocument();
  });

  it('should mask a landline with the dash in its own place', async () => {
    renderComponent({ ...DEFAULT_PROPS, contact: { ...CONTACT, phone: '1523456789' } });

    const dialog = await openDialog();

    expect(dialog.getByRole('link', { name: '(15) 2345-6789' })).toHaveAttribute(
      'href',
      'https://wa.me/551523456789?text=Ol%C3%A1',
    );
  });

  it('should show only the channel the contact has', async () => {
    renderComponent({ ...DEFAULT_PROPS, contact: { ...CONTACT, phone: null } });

    const dialog = await openDialog();

    expect(dialog.getByRole('link', { name: sendEmailLabel(EMAIL) })).toBeInTheDocument();
    expect(dialog.getAllByRole('link')).toHaveLength(1);
  });

  it('should drop the email channel when there is no email', async () => {
    renderComponent({ ...DEFAULT_PROPS, contact: { ...CONTACT, email: null } });

    const dialog = await openDialog();

    expect(dialog.getByRole('link', { name: '(15) 90000-0000' })).toBeInTheDocument();
    expect(dialog.getAllByRole('link')).toHaveLength(1);
  });

  it('should download the photo only once the contact is opened', async () => {
    let downloads = 0;
    thumbnailAnswering(() => {
      downloads += 1;
    });
    renderComponent({ ...DEFAULT_PROPS, contact: CONTACT_WITH_PHOTO });

    expect(screen.getByRole('button', { name: CONTACT_LABEL })).toBeInTheDocument();
    await waitFor(() => expect(downloads).toBe(0));

    const dialog = await openDialog();

    await waitFor(() =>
      expect(dialog.getByRole('img', { name: CONTACT.name }).querySelector('img')).toHaveAttribute(
        'src',
        OBJECT_URL,
      ),
    );
    expect(downloads).toBe(1);
  });

  it('should pulse in the circle while the photo loads, then show it', async () => {
    let release: VoidFunction = vi.fn();
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.get(THUMBNAIL_URL, async () => {
        await released;

        return new HttpResponse(WEBP_BYTES, { headers: { 'Content-Type': 'image/webp' } });
      }),
    );
    renderComponent({ ...DEFAULT_PROPS, contact: CONTACT_WITH_PHOTO });

    const dialog = await openDialog();

    expect(dialog.getByRole('img', { name: CONTACT.name })).toHaveAttribute('aria-busy', 'true');
    release();
    await waitFor(() =>
      expect(dialog.getByRole('img', { name: CONTACT.name }).querySelector('img')).toHaveAttribute(
        'src',
        OBJECT_URL,
      ),
    );
  });

  it('should show the initials and download nothing when there is no photo', async () => {
    const onRequest = vi.fn();
    thumbnailAnswering(onRequest);
    renderComponent();

    const dialog = await openDialog();

    expect(dialog.getByRole('img', { name: CONTACT.name })).toHaveTextContent(INITIALS);
    expect(onRequest).not.toHaveBeenCalled();
  });

  it('should fall back to the initials when the photo fails to download', async () => {
    thumbnailAnswering(vi.fn(), SERVER_ERROR);
    renderComponent({ ...DEFAULT_PROPS, contact: CONTACT_WITH_PHOTO });

    const dialog = await openDialog();

    await waitFor(() =>
      expect(dialog.getByRole('img', { name: CONTACT.name })).toHaveTextContent(INITIALS),
    );
  });
});
