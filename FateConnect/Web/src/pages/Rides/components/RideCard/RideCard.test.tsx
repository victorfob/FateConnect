import { REMOVAL_DIALOG } from '@app/components/PublicationRemoval/constants';
import { DESCRIPTION_TOGGLE_LABELS } from '@app/constants/cardDescription';
import { RIDE_CARD_LABELS } from '@app/pages/Rides/constants';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { ProfileTypeEnum } from '@app/services/auth/types';
import {
  RideFrequencyEnum,
  RideTypeEnum,
  VehicleTypeEnum,
  type Ride,
} from '@app/services/rides/types';
import { render, screen, userEvent } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';
import { forgeOverflow, restoreContentHeight } from '@app/test/utils/contentHeight';

import { REMOVAL_MESSAGE } from './RideAdminRemoval/constants';
import { RideCard } from '.';

const RIDE: Ride = {
  id: '5d1c7e2a-8b4f-4c3d-9e6a-1f2b3c4d5e6f',
  destination: 'Fatec Sorocaba',
  departureDate: '2026-10-28',
  departureTime: '23:45:00',
  createdAt: '2026-10-01T10:00:00',
  rideType: RideTypeEnum.SOLIDARITY,
  vehicleType: VehicleTypeEnum.MOTORCYCLE,
  description: 'Saio do portão principal.',
  driver: {
    name: 'Marina Duarte',
    email: 'marina.duarte@example.com',
    phone: '(15) 99999-0001',
    thumbnailUrl: null,
  },
  isOwner: false,
  frequency: RideFrequencyEnum.WEEKDAYS,
  repeatUntil: '2026-12-18',
};

const renderComponent = (ride = RIDE) =>
  render(<RideCard ride={ride} onEdit={vi.fn()} onDelete={vi.fn()} />);

const DEPARTURE = 'Próxima: 28/10 às 23:45';

/** O que vem depois da fileira de informações, que é o lugar da descrição. */
function afterTheInfoRow() {
  return screen.getByText(DEPARTURE).parentElement?.parentElement?.nextElementSibling ?? null;
}

describe('RideCard', () => {
  afterEach(() => {
    restoreContentHeight();
  });

  it('should list the vehicle, the recurrence and the departure, from the shortest text', () => {
    renderComponent();

    expect(screen.getByRole('article')).toHaveTextContent(`MotoDias úteis${DEPARTURE}`);
  });

  it('should collapse a long description behind the expansion', () => {
    forgeOverflow();
    renderComponent();

    expect(screen.getByText(RIDE.description ?? '')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: DESCRIPTION_TOGGLE_LABELS.expand }),
    ).toBeInTheDocument();
  });

  it('should leave nothing after the info row when the ride has no description', () => {
    const { rerender } = renderComponent();
    expect(afterTheInfoRow()).toHaveTextContent(RIDE.description ?? '');

    rerender(
      <RideCard ride={{ ...RIDE, description: null }} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(afterTheInfoRow()).toBeNull();
  });

  it('should offer the removal to an administrator on the ride of someone else', async () => {
    tokenStorage.save(tokenWithName('Helena Prado', ProfileTypeEnum.ADMINISTRATOR));
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: REMOVAL_DIALOG.trigger }));

    expect(await screen.findByRole('dialog', { name: REMOVAL_DIALOG.title })).toHaveTextContent(
      `${REMOVAL_MESSAGE.prefix}${RIDE.destination}${REMOVAL_MESSAGE.suffix}`,
    );
  });

  it('should keep only the own delete on the ride of an administrator', () => {
    tokenStorage.save(tokenWithName('Helena Prado', ProfileTypeEnum.ADMINISTRATOR));
    renderComponent({ ...RIDE, isOwner: true });

    expect(screen.getAllByRole('button', { name: RIDE_CARD_LABELS.delete })).toHaveLength(1);
    expect(screen.getByRole('button', { name: RIDE_CARD_LABELS.edit })).toBeInTheDocument();
  });

  it('should leave the removal out for whoever does not administer', () => {
    tokenStorage.save(tokenWithName('Helena Prado', ProfileTypeEnum.OPERATOR));
    renderComponent();

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: REMOVAL_DIALOG.trigger })).not.toBeInTheDocument();
  });
});
