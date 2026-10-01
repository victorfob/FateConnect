import { http, HttpResponse } from 'msw';

import { BACK_TO_MENU_LABEL } from '@app/components/BackToMenu/constants';
import { CONTACT_FIELD_LABELS, CONTACT_MESSAGES } from '@app/components/ContactFields/constants';
import { PHOTO_FIELD_TEXTS, PHOTO_MESSAGES } from '@app/components/PhotoField/constants';
import { ContactBanner } from '@app/layouts/MainLayout/components/ContactBanner';
import { CONTACT_BANNER_TEXT } from '@app/layouts/MainLayout/components/ContactBanner/constants';
import { DrawerSignOut } from '@app/layouts/MainLayout/components/DrawerSignOut';
import { SIGN_OUT_LABEL } from '@app/layouts/MainLayout/components/DrawerSignOut/constants';
import { server } from '@app/mocks/server';
import { SignupConflictFieldEnum } from '@app/pages/Signup/@types';
import { FIELD_LABELS, SIGNUP_CONFLICT_MESSAGES } from '@app/pages/Signup/constants';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { PROFILE } from '@app/test/profile';
import { act, screen, userEvent, waitFor, within } from '@app/test/testing-library';
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
import {
  FATEC_EMAIL_HELP,
  NEIGHBORHOOD_HELP,
  NEIGHBORHOOD_LABEL,
} from './components/PersonalDataFields/constants';
import { PHOTO_LABEL } from './components/PhotoCard/constants';
import { PHOTO_CROP_TEXTS } from './components/PhotoCropDialog/constants';
import { cropPhoto } from './components/PhotoCropDialog/helpers/cropPhoto';
import { SAVE_BAR_TEXTS } from './components/SaveBar/constants';
import { UNSAVED_CHANGES } from './components/UnsavedChangesDialog/constants';
import { PROFILE_MESSAGES } from './constants';
import { PASSWORD_MESSAGES } from './schema';
import { Profile } from '.';

// No jsdom não há geometria: a área do recorte chega assim que o recortador monta.
vi.mock('react-easy-crop', async () => {
  const { useEffect } = await import('react');
  const mockArea = { x: 0, y: 0, width: 400, height: 400 };

  return {
    default: function MockCropper({
      onCropComplete,
    }: {
      onCropComplete: (area: typeof mockArea, areaPixels: typeof mockArea) => void;
    }) {
      useEffect(() => onCropComplete(mockArea, mockArea), [onCropComplete]);

      return null;
    },
  };
});

// O canvas não existe no jsdom; o recorte em si tem teste próprio.
vi.mock('./components/PhotoCropDialog/helpers/cropPhoto', () => ({
  cropPhoto: vi.fn(
    async (photo: File) => new File(['recortada'], photo.name, { type: photo.type }),
  ),
}));

const PROFILE_URL = 'https://api.fateconnect.test/users/me';
const LOGOUT_URL = 'https://api.fateconnect.test/auth/logout';
const STORED_PHOTO_URL = 'https://api.fateconnect.test/uploads/user/perfil.png';
const OBJECT_URL = 'blob:https://fateconnect.test/perfil';
const NEW_TOKEN = tokenWithName('Maria da Silva');

const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const SERVER_ERROR = 500;
const CONFLICT = 409;

function serveProfile(profile = PROFILE) {
  server.use(http.get(PROFILE_URL, () => HttpResponse.json(profile)));
}

async function renderProfile(profile = PROFILE) {
  serveProfile(profile);
  renderAtRoute(RoutePathEnum.PROFILE, <Profile />);

  return screen.findByRole('textbox', { name: new RegExp(FIELD_LABELS.fullName) });
}

/** A saída da conta mora no cromo, e entra ao lado da tela para o caso alcançá-la. */
async function renderProfileWithSignOut() {
  serveProfile();
  const router = renderAtRoute(
    RoutePathEnum.PROFILE,
    <>
      <Profile />
      <DrawerSignOut />
    </>,
  );
  const fullName = await screen.findByRole('textbox', { name: new RegExp(FIELD_LABELS.fullName) });

  return { router, fullName };
}

function unloadIsHeldBack(): boolean {
  const unload = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(unload);

  return unload.defaultPrevented;
}

const saveButton = () => screen.getByRole('button', { name: SAVE_BAR_TEXTS.save });

const mockCropPhoto = cropPhoto as Mock;

async function pickPhoto(name = 'perfil.png', type = 'image/png') {
  await userEvent.upload(screen.getByLabelText(PHOTO_LABEL), new File(['foto'], name, { type }), {
    applyAccept: false,
  });
}

/** O "Aplicar" só habilita com a área calculada, e ela espera a foto ser lida do arquivo. */
async function applyCrop() {
  const dialog = await screen.findByRole('dialog', { name: PHOTO_CROP_TEXTS.title });
  const apply = within(dialog).getByRole('button', { name: PHOTO_CROP_TEXTS.apply });
  await waitFor(() => expect(apply).toBeEnabled());
  await userEvent.click(apply);
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
  });

  it('should explain behind the help icon how to change the locked Fatec e-mail', async () => {
    await renderProfile();

    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(FIELD_LABELS.fatecEmail) }),
    );

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(FATEC_EMAIL_HELP);
    expect(screen.getByText(FATEC_EMAIL_HELP).closest('[role="tooltip"]')).toBe(tooltip);
    expect(
      screen.getByRole('textbox', { name: FIELD_LABELS.fatecEmail }),
    ).not.toHaveAccessibleDescription();
  });

  it('should explain what the neighborhood is for', async () => {
    await renderProfile();

    await userEvent.click(screen.getByRole('button', { name: new RegExp(NEIGHBORHOOD_LABEL) }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(NEIGHBORHOOD_HELP);
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

  it('should let whoever has no contact save without one, with the fields optional', async () => {
    let sent: { phone: FormDataEntryValue | null; contactEmail: FormDataEntryValue | null } | null =
      null;
    const withoutContact = { ...PROFILE, phone: null, contactEmail: null };
    server.use(
      http.patch(PROFILE_URL, async ({ request }) => {
        const body = await request.formData();
        sent = { phone: body.get('Phone'), contactEmail: body.get('ContactEmail') };

        return HttpResponse.json({ ...withoutContact, fullName: 'Maria Rocha' });
      }),
    );
    const fullName = await renderProfile(withoutContact);

    expect(screen.getByLabelText(CONTACT_FIELD_LABELS.phone)).not.toBeRequired();
    await userEvent.clear(fullName);
    await userEvent.type(fullName, 'Maria Rocha');
    await userEvent.click(saveButton());

    expect(await screen.findByText(PROFILE_MESSAGES.saved)).toBeInTheDocument();
    expect(sent).toEqual({ phone: '', contactEmail: '' });
  });

  it('should name the account to the password manager, so the empty contact is not taken for the login', async () => {
    await renderProfile({ ...PROFILE, phone: null, contactEmail: null });

    const currentPassword = screen.getByLabelText(PASSWORD_LABELS.current);
    const usernames = [
      ...(currentPassword.closest('form')?.querySelectorAll('[autocomplete="username"]') ?? []),
    ];

    expect(usernames).toHaveLength(1);
    const [username] = usernames;
    expect(username).toHaveValue(PROFILE.fatecEmail);
    expect(username).not.toBeVisible();
    expect(username?.compareDocumentPosition(currentPassword)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('should take the contact warning away as soon as the contact is saved, with no new login', async () => {
    const withoutContact = { ...PROFILE, phone: null, contactEmail: null };
    serveProfile(withoutContact);
    server.use(http.patch(PROFILE_URL, () => HttpResponse.json(PROFILE)));
    renderAtRoute(
      RoutePathEnum.PROFILE,
      <>
        <ContactBanner />
        <Profile />
      </>,
    );
    expect(await screen.findByText(CONTACT_BANNER_TEXT)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(CONTACT_FIELD_LABELS.phone), '15991234567');
    await userEvent.type(
      screen.getByLabelText(CONTACT_FIELD_LABELS.contactEmail),
      'maria@exemplo.test',
    );
    await userEvent.click(saveButton());

    expect(await screen.findByText(PROFILE_MESSAGES.saved)).toBeInTheDocument();
    expect(screen.queryByText(CONTACT_BANNER_TEXT)).not.toBeInTheDocument();
  });

  it.each([
    ['phone', SignupConflictFieldEnum.PHONE, CONTACT_FIELD_LABELS.phone],
    ['e-mail', SignupConflictFieldEnum.CONTACT_EMAIL, CONTACT_FIELD_LABELS.contactEmail],
  ])(
    'should point at the contact %s the api says is already taken, and keep the change pending',
    async (_, field, label) => {
      server.use(
        http.patch(PROFILE_URL, () =>
          HttpResponse.json({ error: 'em uso', field, code: null }, { status: CONFLICT }),
        ),
      );
      await renderProfile({ ...PROFILE, phone: null, contactEmail: null });

      await userEvent.type(screen.getByLabelText(CONTACT_FIELD_LABELS.phone), '15991234567');
      await userEvent.type(
        screen.getByLabelText(CONTACT_FIELD_LABELS.contactEmail),
        'maria@exemplo.test',
      );
      await userEvent.click(saveButton());

      expect(await screen.findByText(SIGNUP_CONFLICT_MESSAGES[field])).toBeInTheDocument();
      expect(screen.getByLabelText(label)).toHaveFocus();
      expect(screen.queryByText(PROFILE_MESSAGES.saveFailed)).not.toBeInTheDocument();
      expect(saveButton()).toBeEnabled();
    },
  );

  it('should ask for the email when only the phone is filled in', async () => {
    await renderProfile({ ...PROFILE, phone: null, contactEmail: null });

    await userEvent.type(screen.getByLabelText(CONTACT_FIELD_LABELS.phone), '15991234567');
    await userEvent.click(saveButton());

    expect(await screen.findByText(CONTACT_MESSAGES.contactEmailRequired)).toBeInTheDocument();
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

  it('should ask to adjust the picked photo, and take the adjusted one', async () => {
    await renderProfile();

    await pickPhoto();
    const dialog = await screen.findByRole('dialog', { name: PHOTO_CROP_TEXTS.title });

    expect(within(dialog).getByText(PHOTO_CROP_TEXTS.hint)).toBeInTheDocument();
    expect(within(dialog).getByRole('slider', { name: PHOTO_CROP_TEXTS.zoom })).toBeInTheDocument();

    await applyCrop();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // A prévia é lida do arquivo em segundo plano, e só com ela o botão vira "Trocar".
    expect(
      await screen.findByRole('button', { name: PHOTO_FIELD_TEXTS.replace }),
    ).toBeInTheDocument();
    expect(saveButton()).toBeEnabled();
  });

  it('should zoom in on the photo from the keyboard', async () => {
    await renderProfile();

    await pickPhoto();
    const zoom = await screen.findByRole('slider', { name: PHOTO_CROP_TEXTS.zoom });
    act(() => zoom.focus());
    await userEvent.keyboard('{ArrowRight}');

    expect(zoom).toHaveAttribute('aria-valuenow', '1.1');
  });

  it('should leave the photo as it was when the adjustment is cancelled', async () => {
    await renderProfile();

    await pickPhoto();
    const dialog = await screen.findByRole('dialog', { name: PHOTO_CROP_TEXTS.title });
    await userEvent.click(within(dialog).getByRole('button', { name: PHOTO_CROP_TEXTS.cancel }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.pick })).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('should warn and keep the adjustment open when the photo cannot be cut', async () => {
    mockCropPhoto.mockRejectedValueOnce(new Error('sem canvas'));
    await renderProfile();

    await pickPhoto();
    await applyCrop();

    expect(await screen.findByText(PHOTO_CROP_TEXTS.failed)).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: PHOTO_CROP_TEXTS.title })).toBeInTheDocument();
  });

  it('should refuse a photo in another format, in place of the hint', async () => {
    await renderProfile();

    await pickPhoto('perfil.gif', 'image/gif');

    expect(await screen.findByText(PHOTO_MESSAGES.formatInvalid)).toBeInTheDocument();
    expect(screen.queryByText(PHOTO_FIELD_TEXTS.hint)).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should drop a picked photo without touching the stored one when there is none', async () => {
    await renderProfile();

    await pickPhoto();
    await applyCrop();
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

  it('should ask before leaving with unsaved changes, and stay when the leave is canceled', async () => {
    const { router, fullName } = await renderProfileWithSignOut();
    await userEvent.type(fullName, ' Rocha');

    await userEvent.click(screen.getByRole('link', { name: BACK_TO_MENU_LABEL }));
    const dialog = screen.getByRole('dialog', { name: UNSAVED_CHANGES.title });

    expect(within(dialog).getByText(UNSAVED_CHANGES.message)).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: UNSAVED_CHANGES.cancel }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe(RoutePathEnum.PROFILE);
    expect(fullName).toHaveValue(`${PROFILE.fullName} Rocha`);
  });

  it('should leave the screen once the changes are discarded', async () => {
    const { router, fullName } = await renderProfileWithSignOut();
    await userEvent.type(fullName, ' Rocha');

    await userEvent.click(screen.getByRole('link', { name: BACK_TO_MENU_LABEL }));
    await userEvent.click(screen.getByRole('button', { name: UNSAVED_CHANGES.discard }));

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
  });

  it('should leave without asking when nothing changed', async () => {
    const { router } = await renderProfileWithSignOut();

    await userEvent.click(screen.getByRole('link', { name: BACK_TO_MENU_LABEL }));

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should not ask when the navigation stays on the screen', async () => {
    const { router, fullName } = await renderProfileWithSignOut();
    await userEvent.type(fullName, ' Rocha');

    await act(() => router.navigate(RoutePathEnum.PROFILE));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fullName).toHaveValue(`${PROFILE.fullName} Rocha`);
  });

  it('should hold the sign out too, and end the session only once the changes are discarded', async () => {
    server.use(http.post(LOGOUT_URL, () => new HttpResponse(null, { status: NO_CONTENT })));
    const { fullName } = await renderProfileWithSignOut();
    await userEvent.type(fullName, ' Rocha');

    await userEvent.click(screen.getByRole('button', { name: SIGN_OUT_LABEL }));
    await userEvent.click(screen.getByRole('button', { name: UNSAVED_CHANGES.cancel }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    expect(tokenStorage.getToken()).not.toBeNull();

    await userEvent.click(screen.getByRole('button', { name: SIGN_OUT_LABEL }));
    await userEvent.click(screen.getByRole('button', { name: UNSAVED_CHANGES.discard }));

    expect(tokenStorage.getToken()).toBeNull();
  });

  it('should have the browser warn on closing the tab only while there are unsaved changes', async () => {
    const { fullName } = await renderProfileWithSignOut();

    expect(unloadIsHeldBack()).toBe(false);

    await userEvent.type(fullName, ' Rocha');

    expect(unloadIsHeldBack()).toBe(true);
  });
});
