import { AccountStatusEnum } from '@app/services/users/types';

import { accountStatusLabel, accountStatusTone, parseAccountStatus } from './accountStatus';

describe('accountStatus', () => {
  it('should tell a deactivated account from a banned one, in label and in tone', () => {
    expect(accountStatusLabel(AccountStatusEnum.SELF_DEACTIVATED)).toBe('Desativada');
    expect(accountStatusLabel(AccountStatusEnum.BANNED)).toBe('Banida');
    expect(accountStatusTone(AccountStatusEnum.SELF_DEACTIVATED)).toBe('muted');
    expect(accountStatusTone(AccountStatusEnum.BANNED)).toBe('danger');
  });

  it('should fall back to a neutral mark for a status the api invents', () => {
    expect(accountStatusLabel('Suspended')).toBe('—');
    expect(accountStatusTone('Suspended')).toBe('neutral');
  });

  it('should read the address in any case and ignore what it does not know', () => {
    expect(parseAccountStatus(' Banida ')).toBe(AccountStatusEnum.BANNED);
    expect(parseAccountStatus('suspensa')).toBeNull();
    expect(parseAccountStatus(null)).toBeNull();
  });
});
