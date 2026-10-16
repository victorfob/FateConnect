import { PROFILE } from '@app/test/profile';

import { toProfileFormValues, toProfileInput } from './mapper';

describe('toProfileFormValues', () => {
  it('should leave the neighborhood blank when the account never filled it', () => {
    expect(toProfileFormValues({ ...PROFILE, neighborhood: null }).neighborhood).toBe('');
  });

  it('should show the stored birth day and send the same day back', () => {
    const values = toProfileFormValues({ ...PROFILE, birthDate: '1999-05-22' });

    expect(values.birthDate).toBe('22/05/1999');
    expect(toProfileInput({ ...values, photo: null }).birthDate).toBe('1999-05-22');
  });
});

describe('toProfileInput', () => {
  it('should send the birth date as the calendar day and the phone as digits', () => {
    const input = toProfileInput({
      ...toProfileFormValues(PROFILE),
      photo: null,
    });

    expect(input).toEqual({
      fullName: PROFILE.fullName,
      birthDate: '2001-04-18',
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
