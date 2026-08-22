import { render, screen, userEvent } from '@app/test/testing-library';

import { OFFER_MODE } from '../../components/RideFormDialog/constants';
import * as C from './constants';
import { OfferRide } from '.';

describe('OfferRide', () => {
  it('should keep the dialog closed until the call to action is used', () => {
    render(<OfferRide />);

    expect(screen.getByRole('button', { name: C.OFFER_BUTTON_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: OFFER_MODE.title })).not.toBeInTheDocument();
  });

  it('should open the offer dialog from the call to action', async () => {
    render(<OfferRide />);

    await userEvent.click(screen.getByRole('button', { name: C.OFFER_BUTTON_LABEL }));

    expect(await screen.findByRole('heading', { name: OFFER_MODE.title })).toBeInTheDocument();
  });
});
