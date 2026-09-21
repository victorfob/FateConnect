import { DenunciationStatusEnum } from '@app/services/denunciations/types';
import { FIRST_PAGE, PAGE_SIZE } from '@app/utils/searchParams';

import { denunciationSearchCodec } from './searchQuery';

const SECOND_PAGE = 2;

describe('denunciationSearchCodec', () => {
  it('should read an empty address as every situation, on the first page', () => {
    const filter = denunciationSearchCodec.fromParams(new URLSearchParams());

    expect(filter).toEqual({ page: FIRST_PAGE, pageSize: PAGE_SIZE });
  });

  it('should read the situation the address carries', () => {
    const filter = denunciationSearchCodec.fromParams(new URLSearchParams('situacao=descartada'));

    expect(filter.status).toBe(DenunciationStatusEnum.DISMISSED);
  });

  it('should fall back to every situation when the address names one that does not exist', () => {
    const filter = denunciationSearchCodec.fromParams(new URLSearchParams('situacao=arquivada'));

    expect(filter.status).toBeUndefined();
  });

  it('should write the situation as the label without accent', () => {
    const params = denunciationSearchCodec.toParams({ status: DenunciationStatusEnum.IN_REVIEW });

    expect(params).toEqual({ situacao: 'em-analise' });
  });

  it('should keep the first page out of the address and write the others', () => {
    expect(denunciationSearchCodec.toParams({ page: FIRST_PAGE })).toEqual({});
    expect(denunciationSearchCodec.toParams({ page: SECOND_PAGE })).toEqual({
      pagina: String(SECOND_PAGE),
    });
  });
});
