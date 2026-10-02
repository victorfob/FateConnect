import { createMemoryRouter, RouterProvider } from 'react-router';

import { FOOTER_COPYRIGHT_LINES } from '@app/constants/appContact';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent, within } from '@app/test/testing-library';

import { GuestLayout } from '.';

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        element: <GuestLayout />,
        children: [{ path: RoutePathEnum.LANDING, element: <div>landing</div> }],
      },
    ],
    { initialEntries: [RoutePathEnum.LANDING] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

// O botão de menu só aparece abaixo do limite do cabeçalho, por CSS. O jsdom não
// avalia media query: ele fica com `display: none` e é buscado com `hidden`.
describe('GuestLayout', () => {
  it('should render the guest header and the footer around the routed content', () => {
    renderLayout();

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByText('landing')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Entre em contato' })).toBeInTheDocument();
    FOOTER_COPYRIGHT_LINES.forEach((line) => expect(screen.getByText(line)).toBeInTheDocument());
  });

  it('should open the navigation drawer from the hamburger button', async () => {
    renderLayout();

    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu', hidden: true }));

    const drawer = screen.getByRole('presentation');
    expect(within(drawer).getByRole('button', { name: 'Como funciona' })).toBeInTheDocument();
  });

  it('should close the drawer and go to the section when a drawer item is selected', async () => {
    const router = renderLayout();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu', hidden: true }));

    const drawer = screen.getByRole('presentation');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Serviços' }));

    expect(router.state.location.hash).toBe('');
    expect(document.getElementById(LandingSectionEnum.SERVICES)).not.toBeInTheDocument();
  });

  it('should point the logo to the landing page', () => {
    renderLayout();

    expect(screen.getAllByRole('link', { name: 'FateConnect' })[0]).toHaveAttribute(
      'href',
      RoutePathEnum.LANDING,
    );
  });

  it('should navigate to the landing section when a header button is clicked', async () => {
    const router = renderLayout();

    await userEvent.click(screen.getByRole('button', { name: 'Serviços' }));

    expect(router.state.location.hash).toBe('');
  });
});
