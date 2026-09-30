import { PROFILE } from '@app/test/profile';

import { toProfileFormValues, toProfileInput } from './mapper';

describe('toProfileFormValues', () => {
  it('should leave the neighborhood blank when the account never filled it', () => {
    expect(toProfileFormValues({ ...PROFILE, neighborhood: null }).neighborhood).toBe('');
  });
});

describe('toProfileInput', () => {
  it('should send the birth date as UTC midnight and the phone as digits', () => {
    const input = toProfileInput({
      ...toProfileFormValues(PROFILE),
      photo: null,
    });

    expect(input).toEqual({
      fullName: PROFILE.fullName,
      birthDate: '2001-04-18T00:00:00Z',
      gender: PROFILE.gender,
      phone: PROFILE.phone,
      contactEmail: PROFILE.contactEmail,
      neighborhood: PROFILE.neighborhood,
      image: null,
    });
  });

  it('should send an empty birth date when the value is not a date', () => {
    expect(toProfileInput({ ...toProfileFormValues(PROFILE), birthDate: '31/02' }).birthDate).toBe(
      '',
    );
  });
});
