import { RideShiftEnum, RideTypeEnum } from '@app/services/rides/types';
import { FIRST_PAGE, PAGE_SIZE } from '@app/utils/searchParams';

import { rideSearchCodec } from './searchQuery';

const read = (search: string) => rideSearchCodec.fromParams(new URLSearchParams(search));

describe('rideSearchCodec', () => {
  describe('fromParams', () => {
    it('should fall back to the first page and the fixed size when the url is empty', () => {
      expect(read('')).toEqual({ page: FIRST_PAGE, pageSize: PAGE_SIZE });
    });

    it('should read every filter the url carries', () => {
      expect(
        read(
          'pagina=3&busca=Sorocaba&de=2026-09-01&ate=2026-09-05&turno=manha&tipo=solidaria&meus=sim',
        ),
      ).toEqual({
        page: 3,
        pageSize: PAGE_SIZE,
        searchTerm: 'Sorocaba',
        dateFrom: '2026-09-01',
        dateTo: '2026-09-05',
        departureShift: RideShiftEnum.MORNING,
        rideType: RideTypeEnum.SOLIDARITY,
        onlyMine: true,
      });
    });

    it('should take one end of the period without the other', () => {
      expect(read('de=2026-09-01')).toMatchObject({ dateFrom: '2026-09-01' });
      expect(read('ate=2026-09-05')).toMatchObject({ dateTo: '2026-09-05' });
    });

    it.each(['pagina=0', 'pagina=-4', 'pagina=abc', 'pagina='])(
      'should fall back to the first page when the url says %s',
      (search) => {
        expect(read(search).page).toBe(FIRST_PAGE);
      },
    );

    it('should ignore a ride type it does not recognise instead of breaking', () => {
      expect(read('tipo=voadora').rideType).toBeUndefined();
    });

    it('should ignore a shift it does not recognise instead of breaking', () => {
      expect(read('turno=madrugada').departureShift).toBeUndefined();
    });

    it('should not care about the case of the words', () => {
      expect(read('tipo=SOLIDARIA&turno=Noite')).toMatchObject({
        rideType: RideTypeEnum.SOLIDARITY,
        departureShift: RideShiftEnum.NIGHT,
      });
    });

    it.each(['meus=nao', 'meus=', 'meus=talvez'])(
      'should leave "only mine" off when the url says %s',
      (search) => {
        expect(read(search).onlyMine).toBeUndefined();
      },
    );

    it('should drop filters that carry only blank space', () => {
      expect(read('busca=%20%20&de=%20')).toEqual({ page: FIRST_PAGE, pageSize: PAGE_SIZE });
    });

    // O período substituiu a data fixa e o turno substituiu a hora: link antigo
    // salvo deixa de restaurar, e o que ele carrega não pode quebrar a tela.
    it('should ignore the parameters the filter no longer knows', () => {
      expect(read('data=2026-09-01&hora=07:30')).toEqual({
        page: FIRST_PAGE,
        pageSize: PAGE_SIZE,
      });
    });
  });

  describe('toParams', () => {
    it('should keep the default page and size out of the url', () => {
      expect(rideSearchCodec.toParams({ page: FIRST_PAGE, pageSize: PAGE_SIZE })).toEqual({});
    });

    it('should write the words the screen shows', () => {
      const params = rideSearchCodec.toParams({
        page: 2,
        pageSize: PAGE_SIZE,
        rideType: RideTypeEnum.EGALITARIAN,
        departureShift: RideShiftEnum.AFTERNOON,
        searchTerm: 'Sorocaba',
        onlyMine: true,
      });

      expect(params).toEqual({
        pagina: '2',
        tipo: 'igualitaria',
        turno: 'tarde',
        busca: 'Sorocaba',
        meus: 'sim',
      });
    });

    it('should survive a round trip through the url', () => {
      const original = {
        page: 4,
        pageSize: PAGE_SIZE,
        searchTerm: 'Votorantim',
        dateFrom: '2026-09-10',
        dateTo: '2026-09-12',
        departureShift: RideShiftEnum.NIGHT,
        rideType: RideTypeEnum.SOLIDARITY,
        onlyMine: true,
      };

      const params = new URLSearchParams(rideSearchCodec.toParams(original));

      expect(rideSearchCodec.fromParams(params)).toEqual(original);
    });
  });
});
