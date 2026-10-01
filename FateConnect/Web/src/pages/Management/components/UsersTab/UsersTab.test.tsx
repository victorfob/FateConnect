import { createMemoryRouter, RouterProvider } from 'react-router';
import { FILTER_CLEAR_LABEL, FILTER_SUBMIT_LABEL, FILTER_TITLE_PLURAL } from '@design-system';
import { http, HttpResponse } from 'msw';

import { CONFIRMATION } from '@app/components/ConfirmAction/constants';
import { CONTACT_FIELD_LABELS } from '@app/components/ContactFields/constants';
import { server } from '@app/mocks/server';
import { SignupConflictFieldEnum } from '@app/pages/Signup/@types';
import { FIELD_LABELS } from '@app/pages/Signup/constants';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { ProfileTypeEnum } from '@app/services/auth/types';
import type { UserSummary } from '@app/services/users/managementTypes';
import { AccountStatusEnum, type User } from '@app/services/users/types';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { EDIT_LABEL, NO_CONTACT_LABEL, OWN_ACCOUNT_LABEL } from './components/UserCard/constants';
import {
  EDIT_TITLE,
  PROFILE_TYPE_LABEL,
  SUBMIT_LABEL,
  USER_CONFLICT_MESSAGES,
  USER_FORM_MESSAGES,
} from './components/UserFormDialog/constants';
import { FILTER_LABELS } from './components/UsersFilter/constants';
import {
  BAN_ACTION,
  CONFIRM_LABEL,
  REVERT_BAN_ACTION,
} from './components/UserStatusAction/constants';
import * as C from './constants';
import { UsersTab } from '.';

const USERS_URL = 'https://api.fateconnect.test/users';

const ADMIN_ID = 1;
const CONFLICT = 409;
const BAD_REQUEST = 400;
const SERVER_ERROR = 500;

const THUMBNAIL_PATH = 'uploads/user/thumbnails/maria.webp';
const OBJECT_URL = 'blob:https://fateconnect.test/maria';
/** Basta ser corpo binário: o que a tela usa é o blob que o cliente devolve. */
const WEBP_BYTES = 'RIFF\0\0\0\0WEBP';

const OWN_ACCOUNT: UserSummary = {
  id: ADMIN_ID,
  fullName: 'Ana Administradora',
  contactEmail: 'ana@exemplo.test',
  phone: '1533334444',
  thumbnailUrl: null,
  status: AccountStatusEnum.ACTIVE,
};

const ACTIVE_USER_EMAIL = 'maria@exemplo.test';
const EDITED_FULL_NAME = 'Maria Souza';

const ACTIVE_USER: UserSummary = {
  id: 7,
  fullName: 'Maria da Silva',
  contactEmail: ACTIVE_USER_EMAIL,
  phone: '15999998888',
  thumbnailUrl: null,
  status: AccountStatusEnum.ACTIVE,
};

const BANNED_USER: UserSummary = {
  id: 8,
  fullName: 'João Souza',
  contactEmail: 'joao@exemplo.test',
  phone: null,
  thumbnailUrl: null,
  status: AccountStatusEnum.BANNED,
};

const DEACTIVATED_USER: UserSummary = {
  id: 9,
  fullName: 'Carla Lima',
  contactEmail: 'carla@exemplo.test',
  phone: '15988887777',
  thumbnailUrl: null,
  status: AccountStatusEnum.SELF_DEACTIVATED,
};

const NO_CONTACT_USER: UserSummary = {
  id: 10,
  fullName: 'Bruna Costa',
  contactEmail: null,
  phone: null,
  thumbnailUrl: null,
  status: AccountStatusEnum.ACTIVE,
};

function fullUser(summary: UserSummary, profileType = ProfileTypeEnum.OPERATOR): User {
  return {
    id: summary.id,
    fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
    fullName: summary.fullName,
    birthDate: '2000-01-01T00:00:00',
    gender: 'Female',
    phone: summary.phone ?? '',
    contactEmail: summary.contactEmail,
    neighborhood: null,
    imageUrl: null,
    thumbnailUrl: null,
    profileType,
    status: summary.status,
    createdAt: '2026-09-01T12:00:00',
  };
}

function pageWith(items: UserSummary[]) {
  return { items, page: 1, pageSize: 10, total: items.length, totalPages: 1 };
}

function listServing(items: UserSummary[], onRequest?: (request: Request) => void) {
  server.use(
    http.get(USERS_URL, ({ request }) => {
      onRequest?.(request);

      return HttpResponse.json(pageWith(items));
    }),
  );
}

type Received = { path: string; body: unknown };

function patchesRecorded(user: User): Received[] {
  const received: Received[] = [];
  const record = async ({ request }: { request: Request }) => {
    received.push({ path: new URL(request.url).pathname, body: await request.json() });

    return HttpResponse.json(user);
  };

  server.use(
    http.get(`${USERS_URL}/${user.id}`, () => HttpResponse.json(user)),
    http.patch(`${USERS_URL}/${user.id}`, record),
    http.patch(`${USERS_URL}/${user.id}/profile`, record),
    http.patch(`${USERS_URL}/${user.id}/status`, record),
  );

  return received;
}

function renderTab(initialEntry: string = RoutePathEnum.MANAGEMENT) {
  const router = createMemoryRouter([{ path: RoutePathEnum.MANAGEMENT, element: <UsersTab /> }], {
    initialEntries: [initialEntry],
  });
  render(<RouterProvider router={router} />);

  return router;
}

async function cardOf(fullName: string) {
  const name = await screen.findByText(fullName);

  return within(name.closest('article') ?? document.body);
}

async function openEditDialogOf(fullName: string) {
  const card = await cardOf(fullName);
  await userEvent.click(card.getByRole('button', { name: EDIT_LABEL }));

  return within(await screen.findByRole('dialog', { name: EDIT_TITLE }));
}

async function retype(field: HTMLElement, value: string) {
  await userEvent.clear(field);
  await userEvent.type(field, value);
}

describe('UsersTab', () => {
  beforeEach(() => {
    tokenStorage.save(tokenWithName('Ana Administradora', ProfileTypeEnum.ADMINISTRATOR, ADMIN_ID));
  });

  it('should show the contact and a status that tells the two reasons apart', async () => {
    listServing([ACTIVE_USER, BANNED_USER, DEACTIVATED_USER]);

    renderTab();

    const active = await cardOf(ACTIVE_USER.fullName);
    expect(active.getByText(ACTIVE_USER_EMAIL)).toBeInTheDocument();
    expect(active.getByText('(15) 99999-8888')).toBeInTheDocument();
    expect(active.getByText('Ativa')).toBeInTheDocument();
    expect((await cardOf(BANNED_USER.fullName)).getByText('Banida')).toBeInTheDocument();
    expect((await cardOf(DEACTIVATED_USER.fullName)).getByText('Desativada')).toBeInTheDocument();
  });

  it('should say the account has no contact, in place of an empty e-mail', async () => {
    listServing([ACTIVE_USER, NO_CONTACT_USER]);

    renderTab();

    const emailIconsOf = async (fullName: string) =>
      (await screen.findByText(fullName))
        .closest('article')
        ?.querySelectorAll('[data-testid="EmailIcon"]');

    const withoutContact = await cardOf(NO_CONTACT_USER.fullName);
    expect(withoutContact.getByText(NO_CONTACT_LABEL)).toBeInTheDocument();
    expect(await emailIconsOf(NO_CONTACT_USER.fullName)).toHaveLength(0);

    const active = await cardOf(ACTIVE_USER.fullName);
    expect(active.getByText(ACTIVE_USER_EMAIL)).toBeInTheDocument();
    expect(await emailIconsOf(ACTIVE_USER.fullName)).toHaveLength(1);
    expect(active.queryByText(NO_CONTACT_LABEL)).not.toBeInTheDocument();
  });

  it('should show the photo of whoever has one and the initials of whoever has not', async () => {
    URL.createObjectURL = vi.fn(() => OBJECT_URL);
    URL.revokeObjectURL = vi.fn();
    server.use(
      http.get(
        `https://api.fateconnect.test/${THUMBNAIL_PATH}`,
        () => new HttpResponse(WEBP_BYTES, { headers: { 'Content-Type': 'image/webp' } }),
      ),
    );
    listServing([{ ...ACTIVE_USER, thumbnailUrl: THUMBNAIL_PATH }, BANNED_USER]);

    renderTab();

    const withPhoto = await cardOf(ACTIVE_USER.fullName);
    await waitFor(() =>
      expect(
        withPhoto.getByRole('img', { name: ACTIVE_USER.fullName }).querySelector('img'),
      ).toHaveAttribute('src', OBJECT_URL),
    );
    expect(
      (await cardOf(BANNED_USER.fullName)).getByRole('img', { name: BANNED_USER.fullName }),
    ).toHaveTextContent('JS');
  });

  it('should build the request from every field the address names', async () => {
    let asked: string | null = null;
    listServing([], (request) => {
      asked = request.url;
    });

    renderTab(
      `${RoutePathEnum.MANAGEMENT}?aba=usuarios&busca=maria&situacao=banida&perfil=operador`,
    );

    await waitFor(() => expect(asked).toContain('search=maria'));
    expect(asked).toContain('status=Banned');
    expect(asked).toContain('profileType=Operator');
  });

  it('should ask the api for what the filter was given, and keep it in the address', async () => {
    const asked: string[] = [];
    listServing([], (request) => {
      asked.push(request.url);
    });
    const router = renderTab();
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE_PLURAL }));
    await userEvent.type(await screen.findByLabelText(FILTER_LABELS.search), '15999');
    await userEvent.click(screen.getByRole('combobox', { name: FILTER_LABELS.status }));
    await userEvent.click(screen.getByRole('option', { name: 'Desativada' }));
    await userEvent.click(screen.getByRole('combobox', { name: FILTER_LABELS.profileType }));
    await userEvent.click(screen.getByRole('option', { name: 'Administrador' }));
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

    await waitFor(() => expect(asked.at(-1)).toContain('search=15999'));
    expect(asked.at(-1)).toContain('status=SelfDeactivated');
    expect(asked.at(-1)).toContain('profileType=Administrator');
    expect(router.state.location.search).toContain('aba=usuarios');
    expect(router.state.location.search).toContain('situacao=desativada');
  });

  it('should say what the empty list means and how to widen it', async () => {
    listServing([]);

    renderTab();

    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should ask before banning, and say what the ban does', async () => {
    listServing([ACTIVE_USER]);
    const received = patchesRecorded(fullUser(ACTIVE_USER));

    renderTab();
    const card = await cardOf(ACTIVE_USER.fullName);
    await userEvent.click(card.getByRole('button', { name: BAN_ACTION.label }));

    const dialog = within(await screen.findByRole('dialog', { name: BAN_ACTION.dialogTitle }));
    expect(dialog.getByText(ACTIVE_USER.fullName)).toBeInTheDocument();
    expect(received).toEqual([]);

    await userEvent.click(dialog.getByRole('button', { name: CONFIRM_LABEL }));

    await waitFor(() =>
      expect(received).toEqual([
        { path: `/users/${ACTIVE_USER.id}/status`, body: { status: AccountStatusEnum.BANNED } },
      ]),
    );
    expect(await screen.findByText(C.USER_LIST_MESSAGES.banned)).toBeInTheDocument();
  });

  it('should keep the account as it is when the confirmation is dismissed', async () => {
    listServing([ACTIVE_USER]);
    const received = patchesRecorded(fullUser(ACTIVE_USER));

    renderTab();
    const card = await cardOf(ACTIVE_USER.fullName);
    await userEvent.click(card.getByRole('button', { name: BAN_ACTION.label }));
    await userEvent.click(await screen.findByRole('button', { name: CONFIRMATION.dismissLabel }));

    expect(received).toEqual([]);
  });

  it('should offer to revert the ban only to a banned account', async () => {
    listServing([ACTIVE_USER, BANNED_USER]);
    const received = patchesRecorded(fullUser(BANNED_USER));

    renderTab();
    const active = await cardOf(ACTIVE_USER.fullName);
    const banned = await cardOf(BANNED_USER.fullName);

    expect(active.queryByRole('button', { name: REVERT_BAN_ACTION.label })).not.toBeInTheDocument();
    expect(banned.queryByRole('button', { name: BAN_ACTION.label })).not.toBeInTheDocument();

    await userEvent.click(banned.getByRole('button', { name: REVERT_BAN_ACTION.label }));
    await userEvent.click(await screen.findByRole('button', { name: CONFIRM_LABEL }));

    await waitFor(() =>
      expect(received).toEqual([
        { path: `/users/${BANNED_USER.id}/status`, body: { status: AccountStatusEnum.ACTIVE } },
      ]),
    );
    expect(await screen.findByText(C.USER_LIST_MESSAGES.banReverted)).toBeInTheDocument();
  });

  it('should offer no ban on the account of whoever is logged in', async () => {
    listServing([OWN_ACCOUNT, ACTIVE_USER]);

    renderTab();
    const own = await cardOf(OWN_ACCOUNT.fullName);
    const other = await cardOf(ACTIVE_USER.fullName);

    expect(other.getByRole('button', { name: BAN_ACTION.label })).toBeInTheDocument();
    expect(own.queryByRole('button', { name: BAN_ACTION.label })).not.toBeInTheDocument();
    expect(own.getByText(OWN_ACCOUNT_LABEL)).toBeInTheDocument();
  });

  it('should offer no demotion on the account of whoever is logged in', async () => {
    listServing([OWN_ACCOUNT, ACTIVE_USER]);
    patchesRecorded(fullUser(ACTIVE_USER));
    patchesRecorded(fullUser(OWN_ACCOUNT, ProfileTypeEnum.ADMINISTRATOR));

    renderTab();
    const other = await openEditDialogOf(ACTIVE_USER.fullName);
    expect(
      other.getByRole('combobox', { name: new RegExp(PROFILE_TYPE_LABEL) }),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    const own = await openEditDialogOf(OWN_ACCOUNT.fullName);

    expect(own.getByLabelText(new RegExp(FIELD_LABELS.fullName))).toHaveValue(OWN_ACCOUNT.fullName);
    expect(
      own.queryByRole('combobox', { name: new RegExp(PROFILE_TYPE_LABEL) }),
    ).not.toBeInTheDocument();
  });

  it('should save the data as the api reads it, and leave the profile alone when unchanged', async () => {
    listServing([ACTIVE_USER]);
    const received = patchesRecorded(fullUser(ACTIVE_USER));

    renderTab();
    const dialog = await openEditDialogOf(ACTIVE_USER.fullName);
    await retype(dialog.getByLabelText(new RegExp(FIELD_LABELS.fullName)), EDITED_FULL_NAME);
    await userEvent.click(dialog.getByRole('button', { name: SUBMIT_LABEL }));

    await waitFor(() =>
      expect(received).toEqual([
        {
          path: `/users/${ACTIVE_USER.id}`,
          body: {
            fullName: EDITED_FULL_NAME,
            fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
            phone: '15999998888',
            contactEmail: ACTIVE_USER_EMAIL,
          },
        },
      ]),
    );
    expect(await screen.findByText(USER_FORM_MESSAGES.updated)).toBeInTheDocument();
  });

  it('should hold the save of an untouched account until a field changes, and again once undone', async () => {
    listServing([ACTIVE_USER]);
    patchesRecorded(fullUser(ACTIVE_USER));

    renderTab();
    const dialog = await openEditDialogOf(ACTIVE_USER.fullName);
    const save = dialog.getByRole('button', { name: SUBMIT_LABEL });
    const fullName = dialog.getByLabelText(new RegExp(FIELD_LABELS.fullName));

    expect(save).toBeDisabled();

    await retype(fullName, EDITED_FULL_NAME);
    expect(save).toBeEnabled();

    await retype(fullName, ACTIVE_USER.fullName);
    expect(save).toBeDisabled();
  });

  it('should promote through the profile route', async () => {
    listServing([ACTIVE_USER]);
    const received = patchesRecorded(fullUser(ACTIVE_USER));

    renderTab();
    const dialog = await openEditDialogOf(ACTIVE_USER.fullName);
    await userEvent.click(dialog.getByRole('combobox', { name: new RegExp(PROFILE_TYPE_LABEL) }));
    await userEvent.click(screen.getByRole('option', { name: 'Administrador' }));
    await userEvent.click(dialog.getByRole('button', { name: SUBMIT_LABEL }));

    await waitFor(() =>
      expect(received.at(-1)).toEqual({
        path: `/users/${ACTIVE_USER.id}/profile`,
        body: { profileType: ProfileTypeEnum.ADMINISTRATOR },
      }),
    );
  });

  it('should point at the field the api says is already taken', async () => {
    listServing([ACTIVE_USER]);
    patchesRecorded(fullUser(ACTIVE_USER));
    server.use(
      http.patch(`${USERS_URL}/${ACTIVE_USER.id}`, () =>
        HttpResponse.json({ field: SignupConflictFieldEnum.CONTACT_EMAIL }, { status: CONFLICT }),
      ),
    );

    renderTab();
    const dialog = await openEditDialogOf(ACTIVE_USER.fullName);
    await retype(
      dialog.getByLabelText(new RegExp(CONTACT_FIELD_LABELS.contactEmail)),
      'maria.souza@exemplo.test',
    );
    await userEvent.click(dialog.getByRole('button', { name: SUBMIT_LABEL }));

    expect(
      await dialog.findByText(USER_CONFLICT_MESSAGES[SignupConflictFieldEnum.CONTACT_EMAIL]),
    ).toBeInTheDocument();
    expect(dialog.getByLabelText(new RegExp(CONTACT_FIELD_LABELS.contactEmail))).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('should drop every filter when the search is cleared', async () => {
    const asked: string[] = [];
    listServing([], (request) => {
      asked.push(request.url);
    });
    const router = renderTab(
      `${RoutePathEnum.MANAGEMENT}?aba=usuarios&busca=maria&perfil=operador`,
    );
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE_PLURAL }));
    await userEvent.click(await screen.findByRole('button', { name: FILTER_CLEAR_LABEL }));

    await waitFor(() => expect(asked.at(-1)).not.toContain('search'));
    expect(asked.at(-1)).not.toContain('profileType');
    expect(router.state.location.search).toBe('?aba=usuarios');
  });

  it.each([
    ['refuses the data', BAD_REQUEST, USER_FORM_MESSAGES.invalidData],
    ['fails for another reason', SERVER_ERROR, USER_FORM_MESSAGES.failed],
  ])('should keep the dialog open and say so when the api %s', async (_name, status, message) => {
    listServing([ACTIVE_USER]);
    patchesRecorded(fullUser(ACTIVE_USER));
    server.use(
      http.patch(`${USERS_URL}/${ACTIVE_USER.id}`, () => HttpResponse.json({}, { status })),
    );

    renderTab();
    const dialog = await openEditDialogOf(ACTIVE_USER.fullName);
    await retype(dialog.getByLabelText(new RegExp(FIELD_LABELS.fullName)), EDITED_FULL_NAME);
    await userEvent.click(dialog.getByRole('button', { name: SUBMIT_LABEL }));

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: EDIT_TITLE })).toBeInTheDocument();
  });
});
