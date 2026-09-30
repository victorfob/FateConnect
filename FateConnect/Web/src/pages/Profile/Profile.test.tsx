import { http, HttpResponse } from 'msw';

import { PHOTO_FIELD_TEXTS, PHOTO_MESSAGES } from '@app/components/PhotoField/constants';
import { server } from '@app/mocks/server';
import { FIELD_LABELS } from '@app/pages/Signup/constants';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { PROFILE } from '@app/test/profile';
import { screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';
import { renderAtRoute } from '@app/test/utils/renderAtRoute';

import {
  ACCOUNT_ACCESS_SUBSECTIONS,
  ACCOUNT_ACCESS_TITLE,
} from './components/AccountAccessCard/constants';
import {
  ACCOUNT_DATA_SUBSECTIONS,
  ACCOUNT_DATA_TITLE,
} from './components/AccountDataCard/constants';
import { DEACTIVATE } from './components/DeactivateAccount/constants';
import { PASSWORD_LABELS } from './components/PasswordFields/constants';
import { FATEC_EMAIL_HINT, NEIGHBORHOOD_LABEL } from './components/PersonalDataFields/constants';
import { PHOTO_LABEL } from './components/PhotoCard/constants';
import { SAVE_BAR_TEXTS } from './components/SaveBar/constants';
import { PROFILE_MESSAGES } from './constants';
import { PASSWORD_MESSAGES } from './schema';
import { Profile } from '.';

const PROFILE_URL = 'https://api.fateconnect.test/users/me';
const STORED_PHOTO_URL = 'https://api.fateconnect.test/uploads/user/perfil.png';
const OBJECT_URL = 'blob:https://fateconnect.test/perfil';
const NEW_TOKEN = tokenWithName('Maria da Silva');

const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const SERVER_ERROR = 500;

function serveProfile(profile = PROFILE) {
  server.use(http.get(PROFILE_URL, () => HttpResponse.json(profile)));
}

async function renderProfile(profile = PROFILE) {
  serveProfile(profile);
  renderAtRoute(RoutePathEnum.PROFILE, <Profile />);

  return screen.findByRole('textbox', { name: new RegExp(FIELD_LABELS.fullName) });
}

const saveButton = () => screen.getByRole('button', { name: SAVE_BAR_TEXTS.save });

async function pickPhoto(name = 'perfil.png', type = 'image/png') {
  await userEvent.upload(screen.getByLabelText(PHOTO_LABEL), new File(['foto'], name, { type }), {
    applyAccept: false,
  });
}

describe('Profile', () => {
  beforeEach(() => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    // jsdom não implementa a fábrica de URL de objeto, e é dela que sai a foto.
    URL.createObjectURL = vi.fn(() => OBJECT_URL);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should show what the account holds, with the Fatec e-mail locked', async () => {
    const fullName = await renderProfile();

    expect(fullName).toHaveValue(PROFILE.fullName);
    expect(screen.getByRole('textbox', { name: NEIGHBORHOOD_LABEL })).toHaveValue(
      PROFILE.neighborhood,
    );
    expect(screen.getByRole('textbox', { name: /Telefone/ })).toHaveValue('(15) 99123-4567');

    const fatecEmail = screen.getByRole('textbox', { name: FIELD_LABELS.fatecEmail });
    expect(fatecEmail).toHaveValue(PROFILE.fatecEmail);
    expect(fatecEmail).toBeDisabled();
    expect(fatecEmail).toHaveAccessibleDescription(FATEC_EMAIL_HINT);
  });

  it('should group the data and the access in two cards, each with its subsections', async () => {
    await renderProfile();

    const data = screen.getByRole('region', { name: ACCOUNT_DATA_TITLE });
    const access = screen.getByRole('region', { name: ACCOUNT_ACCESS_TITLE });

    expect(
      within(data)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual([ACCOUNT_DATA_SUBSECTIONS.personal, ACCOUNT_DATA_SUBSECTIONS.contact]);
    expect(
      within(access)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual([ACCOUNT_ACCESS_SUBSECTIONS.password, ACCOUNT_ACCESS_SUBSECTIONS.deactivation]);
    expect(within(access).getByLabelText(PASSWORD_LABELS.current)).toBeInTheDocument();
    expect(within(data).getByRole('textbox', { name: NEIGHBORHOOD_LABEL })).toBeInTheDocument();
  });

  it('should keep the save off until something changes, and discard back to what is stored', async () => {
    const fullName = await renderProfile();

    expect(saveButton()).toBeDisabled();
    expect(screen.queryByRole('button', { name: SAVE_BAR_TEXTS.discard })).not.toBeInTheDocument();

    await userEvent.type(fullName, ' Rocha');

    expect(saveButton()).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent(SAVE_BAR_TEXTS.unsaved);

    await userEvent.click(screen.getByRole('button', { name: SAVE_BAR_TEXTS.discard }));

    expect(fullName).toHaveValue(PROFILE.fullName);
    expect(saveButton()).toBeDisabled();
  });

  it('should save the data and show the new name as the saved one', async () => {
    let sentName: FormDataEntryValue | null = null;
    server.use(
      http.patch(PROFILE_URL, async ({ request }) => {
        sentName = (await request.formData()).get('FullName');

        return HttpResponse.json({ ...PROFILE, fullName: 'Maria Rocha' });
      }),
    );
    const fullName = await renderProfile();

    await userEvent.clear(fullName);
    await userEvent.type(fullName, 'Maria Rocha');
    await userEvent.click(saveButton());

    expect(await screen.findByText(PROFILE_MESSAGES.saved)).toBeInTheDocument();
    expect(sentName).toBe('Maria Rocha');
    expect(fullName).toHaveValue('Maria Rocha');
    expect(saveButton()).toBeDisabled();
  });

  it('should warn when the data is not saved', async () => {
    server.use(http.patch(PROFILE_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    const fullName = await renderProfile();

    await userEvent.type(fullName, ' Rocha');
    await userEvent.click(saveButton());

    expect(await screen.findByText(PROFILE_MESSAGES.saveFailed)).toBeInTheDocument();
    expect(saveButton()).toBeEnabled();
  });

  it('should ask for the current password once a new one is typed', async () => {
    await renderProfile();

    await userEvent.type(screen.getByLabelText(PASSWORD_LABELS.new), 'NovaSenha123');
    await userEvent.click(saveButton());

    expect(await screen.findByText(PASSWORD_MESSAGES.currentRequired)).toBeInTheDocument();
  });

  it('should change the password alone, and keep the session with the token it answers', async () => {
    let sent: unknown = null;
    server.use(
      http.patch(`${PROFILE_URL}/password`, async ({ request }) => {
        sent = await request.json();

        return HttpResponse.json({ token: NEW_TOKEN });
      }),
    );
    await renderProfile();

    await userEvent.type(screen.getByLabelText(PASSWORD_LABELS.current), 'SenhaAtual123');
    await userEvent.type(screen.getByLabelText(PASSWORD_LABELS.new), 'NovaSenha123');
    await userEvent.click(saveButton());

    expect(await screen.findByText(PROFILE_MESSAGES.passwordChanged)).toBeInTheDocument();
    expect(sent).toEqual({ currentPassword: 'SenhaAtual123', newPassword: 'NovaSenha123' });
    expect(tokenStorage.getToken()).toBe(NEW_TOKEN);
    expect(screen.getByLabelText(PASSWORD_LABELS.current)).toHaveValue('');
  });

  it('should mark the current password when the API refuses it, and keep the change pending', async () => {
    server.use(
      http.patch(`${PROFILE_URL}/password`, () => new HttpResponse(null, { status: BAD_REQUEST })),
    );
    await renderProfile();

    await userEvent.type(screen.getByLabelText(PASSWORD_LABELS.current), 'errada12345');
    await userEvent.type(screen.getByLabelText(PASSWORD_LABELS.new), 'NovaSenha123');
    await userEvent.click(saveButton());

    expect(await screen.findByText(PROFILE_MESSAGES.currentPasswordWrong)).toBeInTheDocument();
    expect(screen.getByLabelText(PASSWORD_LABELS.new)).toHaveValue('NovaSenha123');
    expect(screen.getByRole('status')).toHaveTextContent(SAVE_BAR_TEXTS.unsaved);
  });

  it('should warn when the password change fails for another reason', async () => {
    server.use(
      http.patch(`${PROFILE_URL}/password`, () => new HttpResponse(null, { status: SERVER_ERROR })),
    );
    await renderProfile();

    await userEvent.type(screen.getByLabelText(PASSWORD_LABELS.current), 'SenhaAtual123');
    await userEvent.type(screen.getByLabelText(PASSWORD_LABELS.new), 'NovaSenha123');
    await userEvent.click(saveButton());

    expect(await screen.findByText(PROFILE_MESSAGES.passwordFailed)).toBeInTheDocument();
  });

  it('should remove the stored photo on save, after the data', async () => {
    const calls: string[] = [];
    server.use(
      http.get(STORED_PHOTO_URL, () =>
        HttpResponse.arrayBuffer(new ArrayBuffer(1), { headers: { 'Content-Type': 'image/png' } }),
      ),
      http.patch(PROFILE_URL, () => {
        calls.push('patch');

        return HttpResponse.json({ ...PROFILE, imageUrl: STORED_PHOTO_URL });
      }),
      http.delete(`${PROFILE_URL}/image`, () => {
        calls.push('delete');

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    await renderProfile({ ...PROFILE, imageUrl: STORED_PHOTO_URL });

    await userEvent.click(await screen.findByRole('button', { name: PHOTO_FIELD_TEXTS.remove }));

    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.pick })).toBeInTheDocument();

    await userEvent.click(saveButton());

    expect(await screen.findByText(PROFILE_MESSAGES.saved)).toBeInTheDocument();
    expect(calls).toEqual(['patch', 'delete']);
  });

  it('should offer swapping the photo once one is picked', async () => {
    await renderProfile();

    await pickPhoto();

    // A prévia é lida do arquivo em segundo plano, e só com ela o botão vira "Trocar".
    expect(
      await screen.findByRole('button', { name: PHOTO_FIELD_TEXTS.replace }),
    ).toBeInTheDocument();
    expect(saveButton()).toBeEnabled();
  });

  it('should refuse a photo in another format, in place of the hint', async () => {
    await renderProfile();

    await pickPhoto('perfil.gif', 'image/gif');

    expect(await screen.findByText(PHOTO_MESSAGES.formatInvalid)).toBeInTheDocument();
    expect(screen.queryByText(PHOTO_FIELD_TEXTS.hint)).not.toBeInTheDocument();
  });

  it('should drop a picked photo without touching the stored one when there is none', async () => {
    await renderProfile();

    await pickPhoto();
    await userEvent.click(await screen.findByRole('button', { name: PHOTO_FIELD_TEXTS.remove }));

    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.pick })).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should deactivate the account after the confirmation, ending the session', async () => {
    server.use(
      http.post(`${PROFILE_URL}/deactivate`, () => new HttpResponse(null, { status: NO_CONTENT })),
    );
    await renderProfile();

    await userEvent.click(screen.getByRole('button', { name: DEACTIVATE.label }));
    const dialog = screen.getByRole('dialog', { name: DEACTIVATE.dialogTitle });
    await userEvent.click(within(dialog).getByRole('button', { name: DEACTIVATE.confirmLabel }));

    expect(await screen.findByText(DEACTIVATE.succeeded)).toBeInTheDocument();
    await waitFor(() => expect(tokenStorage.getToken()).toBeNull());
  });
});
