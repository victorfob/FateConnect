import { ProfileTypeEnum } from '@app/services/auth/types';
import type { UserFilter } from '@app/services/users/managementTypes';
import { AccountStatusEnum } from '@app/services/users/types';
import { FIRST_PAGE, PAGE_SIZE } from '@app/utils/searchParams';

import { managementUserCodec } from './searchQuery';

const { fromParams, toParams } = managementUserCodec;

describe('managementUserCodec', () => {
  it('should read every field the filter offers', () => {
    const params = new URLSearchParams({
      busca: 'maria',
      situacao: 'banida',
      perfil: 'administrador',
      pagina: '3',
    });

    expect(fromParams(params)).toEqual({
      page: 3,
      pageSize: PAGE_SIZE,
      search: 'maria',
      status: AccountStatusEnum.BANNED,
      profileType: ProfileTypeEnum.ADMINISTRATOR,
    });
  });

  it('should leave out what the address does not name', () => {
    expect(fromParams(new URLSearchParams())).toEqual({ page: FIRST_PAGE, pageSize: PAGE_SIZE });
  });

  it('should ignore a status or a profile the product does not know', () => {
    const filter = fromParams(new URLSearchParams({ situacao: 'suspensa', perfil: 'dono' }));

    expect(filter.status).toBeUndefined();
    expect(filter.profileType).toBeUndefined();
  });

  it('should always carry the tab it belongs to', () => {
    expect(toParams({})).toEqual({ aba: 'usuarios' });
  });

  it('should survive the round trip, in the words the address uses', () => {
    const filter: UserFilter = {
      page: 2,
      pageSize: PAGE_SIZE,
      search: 'maria',
      status: AccountStatusEnum.SELF_DEACTIVATED,
      profileType: ProfileTypeEnum.OPERATOR,
    };

    const params = toParams(filter);

    expect(params).toEqual({
      aba: 'usuarios',
      pagina: '2',
      busca: 'maria',
      situacao: 'desativada',
      perfil: 'operador',
    });
    expect(fromParams(new URLSearchParams(params))).toEqual(filter);
  });
});
