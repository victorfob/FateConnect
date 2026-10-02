import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { REGISTER_CONTACTS_LABEL } from '@app/components/ContactRequiredDialog/constants';
import { useProfile } from '@app/hooks/useProfile';
import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { PROFILE } from '@app/test/profile';
import { render, screen, userEvent, within } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import * as C from './constants';
import { ContactBanner } from '.';

const PROFILE_URL = 'https://api.fateconnect.test/users/me';
const USER_NAME = 'Maria da Silva';

function profileAnswering(contact: { phone: string | null; contactEmail: string | null }) {
  server.use(http.get(PROFILE_URL, () => HttpResponse.json({ ...PROFILE, ...contact })));
}

/** Mostra o nome quando o perfil chega: a ausência da faixa só vale depois disso. */
function ProfileProbe() {
  const { data: profile } = useProfile();

  return <span>{profile?.fullName}</span>;
}

function renderBanner(initialRoute = RoutePathEnum.MENU) {
  const router = createMemoryRouter(
    [
      {
        path: RoutePathEnum.MENU,
        element: (
          <>
            <ContactBanner />
            <ProfileProbe />
          </>
        ),
      },
      {
        path: RoutePathEnum.PROFILE,
        element: (
          <>
            <ContactBanner />
            <div>perfil</div>
          </>
        ),
      },
    ],
    { initialEntries: [initialRoute] },
  );

  return render(<RouterProvider router={router} />);
}

describe('ContactBanner', () => {
  beforeEach(() => {
    tokenStorage.save(tokenWithName(USER_NAME));
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('should tell whoever has no contact what is missing, with the way to the profile', async () => {
    profileAnswering({ phone: null, contactEmail: null });

    renderBanner();

    expect(await screen.findByText(C.CONTACT_BANNER_TEXT)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: REGISTER_CONTACTS_LABEL }));
    expect(await screen.findByText('perfil')).toBeInTheDocument();
  });

  it('should keep telling what is missing on the profile, without the way to where it already is', async () => {
    profileAnswering({ phone: null, contactEmail: null });

    renderBanner(RoutePathEnum.PROFILE);

    const banner = await screen.findByRole('status');
    expect(banner).toHaveTextContent(C.CONTACT_BANNER_TEXT);
    expect(
      within(banner).getByRole('button', { name: C.DISMISS_BANNER_LABEL }),
    ).toBeInTheDocument();
    expect(
      within(banner).queryByRole('link', { name: REGISTER_CONTACTS_LABEL }),
    ).not.toBeInTheDocument();
  });

  it('should stay out of the way of whoever already has a contact', async () => {
    const requests: string[] = [];
    server.use(
      http.get(PROFILE_URL, () => {
        requests.push(PROFILE_URL);

        return HttpResponse.json(PROFILE);
      }),
    );

    renderBanner();

    expect(await screen.findByText(PROFILE.fullName)).toBeInTheDocument();
    expect(requests).toHaveLength(1);
    expect(screen.queryByText(C.CONTACT_BANNER_TEXT)).not.toBeInTheDocument();
  });

  it('should keep closed for the rest of the session and come back at the next login', async () => {
    profileAnswering({ phone: null, contactEmail: null });
    const { unmount } = renderBanner();
    await screen.findByText(C.CONTACT_BANNER_TEXT);

    await userEvent.click(screen.getByRole('button', { name: C.DISMISS_BANNER_LABEL }));

    expect(screen.queryByText(C.CONTACT_BANNER_TEXT)).not.toBeInTheDocument();
    unmount();

    const { unmount: unmountAgain } = renderBanner();
    expect(await screen.findByText(PROFILE.fullName)).toBeInTheDocument();
    expect(screen.queryByText(C.CONTACT_BANNER_TEXT)).not.toBeInTheDocument();
    unmountAgain();

    // Cada login traz um token com assinatura própria.
    tokenStorage.save(`${tokenWithName(USER_NAME)}-do-proximo-login`);
    renderBanner();
    expect(await screen.findByText(C.CONTACT_BANNER_TEXT)).toBeInTheDocument();
  });
});
