import { RoutePathEnum } from '@app/routes/paths';
import { screen, userEvent, waitFor } from '@app/test/testing-library';
import { renderAtRoute } from '@app/test/utils/renderAtRoute';

import { DENUNCIATION_FORM } from './components/DenunciationFormDialog/constants';
import * as C from './constants';
import { Denunciations } from '.';

const renderScreen = () => renderAtRoute(RoutePathEnum.DENUNCIATIONS, <Denunciations />);

describe('Denunciations', () => {
  it('should name the screen, explain the channel and offer the way back', () => {
    renderScreen();

    expect(screen.getByRole('heading', { name: C.DENUNCIATIONS_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: C.DENUNCIATIONS_INTRO.title })).toBeInTheDocument();
    expect(screen.getByText(C.DENUNCIATIONS_INTRO.description)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: C.BACK_LABEL })).toBeInTheDocument();
  });

  it('should open the form from the card, and only from it', async () => {
    renderScreen();

    expect(
      screen.queryByRole('heading', { name: DENUNCIATION_FORM.title }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: C.DENUNCIATIONS_INTRO.action }));

    expect(
      await screen.findByRole('heading', { name: DENUNCIATION_FORM.title }),
    ).toBeInTheDocument();
  });

  it('should close the form and leave the card in place', async () => {
    renderScreen();
    await userEvent.click(screen.getByRole('button', { name: C.DENUNCIATIONS_INTRO.action }));
    await screen.findByRole('heading', { name: DENUNCIATION_FORM.title });

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: DENUNCIATION_FORM.title }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: C.DENUNCIATIONS_INTRO.action })).toBeInTheDocument();
  });
});
