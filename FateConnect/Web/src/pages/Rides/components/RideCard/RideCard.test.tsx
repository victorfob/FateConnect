import {
  RideFrequencyEnum,
  RideTypeEnum,
  VehicleTypeEnum,
  type Ride,
} from '@app/services/rides/types';
import { render, screen } from '@app/test/testing-library';

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

describe('RideCard', () => {
  it('should list the vehicle, the recurrence and the departure, from the shortest text', () => {
    renderComponent();

    expect(screen.getByRole('article')).toHaveTextContent('MotoDias úteisPróxima: 28/10 às 23:45');
  });
});
