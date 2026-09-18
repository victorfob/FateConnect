import {
  DenunciationCategoryEnum,
  DenunciationStatusEnum,
  type DenunciationFilter,
} from '@app/services/denunciations/types';
import { FIRST_PAGE, PAGE_SIZE } from '@app/utils/searchParams';

import { managementDenunciationCodec } from './searchQuery';

const { fromParams, toParams } = managementDenunciationCodec;

describe('managementDenunciationCodec', () => {
  it('should read every field the filter offers', () => {
    const params = new URLSearchParams({
      busca: 'velocidade',
      de: '2026-09-01',
      ate: '2026-09-30',
      motivo: 'direcao-imprudente',
      situacao: 'aberta',
      pagina: '3',
    });

    expect(fromParams(params)).toEqual({
      page: 3,
      pageSize: PAGE_SIZE,
      searchTerm: 'velocidade',
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
      category: DenunciationCategoryEnum.RECKLESS_DRIVING,
      status: DenunciationStatusEnum.OPEN,
    });
  });

  it('should leave out what the address does not name', () => {
    expect(fromParams(new URLSearchParams())).toEqual({ page: FIRST_PAGE, pageSize: PAGE_SIZE });
  });

  it('should ignore a motive the product does not know', () => {
    expect(fromParams(new URLSearchParams({ motivo: 'inventado' })).category).toBeUndefined();
  });

  // Sem a aba no endereço, paginar ou filtrar apagaria a aba em que a pessoa está.
  it('should always carry the tab it belongs to', () => {
    expect(toParams({})).toEqual({ aba: 'denuncias' });
  });

  it('should write every field back, in the words the address uses', () => {
    const filter: DenunciationFilter = {
      page: 2,
      searchTerm: 'velocidade',
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
      category: DenunciationCategoryEnum.RECKLESS_DRIVING,
      status: DenunciationStatusEnum.IN_REVIEW,
    };

    expect(toParams(filter)).toEqual({
      aba: 'denuncias',
      pagina: '2',
      busca: 'velocidade',
      de: '2026-09-01',
      ate: '2026-09-30',
      motivo: 'direcao-imprudente',
      situacao: 'em-analise',
    });
  });

  it('should survive the round trip', () => {
    const filter: DenunciationFilter = {
      page: 4,
      pageSize: PAGE_SIZE,
      searchTerm: 'assedio',
      category: DenunciationCategoryEnum.FAKE_PROFILE,
      status: DenunciationStatusEnum.DISMISSED,
    };

    expect(fromParams(new URLSearchParams(toParams(filter)))).toEqual(filter);
  });
});
