import { ReportStatusEnum } from '@app/services/reports/types';
import { FIRST_PAGE, PAGE_SIZE } from '@app/utils/searchParams';

import { reportSearchCodec } from './searchQuery';

const SECOND_PAGE = 2;

describe('reportSearchCodec', () => {
  it('should read an empty address as every situation, on the first page', () => {
    const filter = reportSearchCodec.fromParams(new URLSearchParams());

    expect(filter).toEqual({ page: FIRST_PAGE, pageSize: PAGE_SIZE });
  });

  it('should read the situation the address carries', () => {
    const filter = reportSearchCodec.fromParams(new URLSearchParams('situacao=descartada'));

    expect(filter.status).toBe(ReportStatusEnum.DISMISSED);
  });

  it('should fall back to every situation when the address names one that does not exist', () => {
    const filter = reportSearchCodec.fromParams(new URLSearchParams('situacao=arquivada'));

    expect(filter.status).toBeUndefined();
  });

  it('should write the situation as the label without accent', () => {
    const params = reportSearchCodec.toParams({ status: ReportStatusEnum.IN_REVIEW });

    expect(params).toEqual({ situacao: 'em-analise' });
  });

  it('should keep the first page out of the address and write the others', () => {
    expect(reportSearchCodec.toParams({ page: FIRST_PAGE })).toEqual({});
    expect(reportSearchCodec.toParams({ page: SECOND_PAGE })).toEqual({
      pagina: String(SECOND_PAGE),
    });
  });
});
