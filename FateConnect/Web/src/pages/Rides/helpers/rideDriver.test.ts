import { describe, expect, it } from 'vitest';

import { tokenStorage } from '@app/services/auth/tokenStorage';
import { isOwnRide, RIDE_DRIVER } from './rideDriver';

describe('isOwnRide', () => {
  it('should treat the ride as mine when the driver is the logged user', () => {
    tokenStorage.save('token', RIDE_DRIVER.name);

    expect(isOwnRide(RIDE_DRIVER)).toBe(true);
  });

  it('should treat the ride as someone else’s when the driver has another name', () => {
    tokenStorage.save('token', 'Maria Silva');

    expect(isOwnRide(RIDE_DRIVER)).toBe(false);
  });

  it('should treat the ride as someone else’s when nobody is logged', () => {
    expect(isOwnRide(RIDE_DRIVER)).toBe(false);
  });
});
