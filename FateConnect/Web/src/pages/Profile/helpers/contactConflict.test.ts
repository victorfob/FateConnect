import { SignupConflictFieldEnum } from '@app/pages/Signup/@types';
import { ApiError } from '@app/services/httpClient';

import { contactConflictFieldOf } from './contactConflict';

const CONFLICT = 409;
const BAD_REQUEST = 400;

describe('contactConflictFieldOf', () => {
  it.each([SignupConflictFieldEnum.PHONE, SignupConflictFieldEnum.CONTACT_EMAIL])(
    'should point at the %s the api says is taken',
    (field) => {
      expect(contactConflictFieldOf(new ApiError('em uso', CONFLICT, field))).toBe(field);
    },
  );

  it('should point at nothing for what the profile cannot edit or did not cause', () => {
    expect(
      contactConflictFieldOf(new ApiError('em uso', CONFLICT, SignupConflictFieldEnum.FATEC_EMAIL)),
    ).toBeNull();
    expect(
      contactConflictFieldOf(new ApiError('recusado', BAD_REQUEST, SignupConflictFieldEnum.PHONE)),
    ).toBeNull();
    expect(contactConflictFieldOf(new Error('rede'))).toBeNull();
  });
});
