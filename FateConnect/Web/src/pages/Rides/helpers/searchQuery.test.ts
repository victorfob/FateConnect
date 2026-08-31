import { RideTypeEnum } from '@app/services/rides/types';
import { FIRST_PAGE, PAGE_SIZE } from '@app/utils/searchParams';

import { rideSearchCodec } from './searchQuery';

const read = (search: string) => rideSearchCodec.fromParams(new URLSearchParams(search));

describe('rideSearchCodec', () => {
  describe('fromParams', () => {
    it('should fall back to the first page and the fixed size when the url is empty', () => {
      expect(read('')).toEqual({ page: FIRST_PAGE, pageSize: PAGE_SIZE });
    });

    it('should read every filter the url carries', () => {
      expect(read('pagina=3&destino=Sorocaba&data=2026-09-01&hora=07:30&tipo=solidaria')).toEqual({
        page: 3,
        pageSize: PAGE_SIZE,
        destination: 'Sorocaba',
        departureDate: '2026-09-01',
        departureTime: '07:30',
        rideType: RideTypeEnum.SOLIDARITY,
      });
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

    it('should not care about the case of the ride type', () => {
      expect(read('tipo=SOLIDARIA').rideType).toBe(RideTypeEnum.SOLIDARITY);
    });

    it('should drop filters that carry only blank space', () => {
      expect(read('destino=%20%20&hora=%20')).toEqual({ page: FIRST_PAGE, pageSize: PAGE_SIZE });
    });
  });

  describe('toParams', () => {
    it('should keep the default page and size out of the url', () => {
      expect(rideSearchCodec.toParams({ page: FIRST_PAGE, pageSize: PAGE_SIZE })).toEqual({});
    });

    it('should write the ride type in the words the screen shows', () => {
      const params = rideSearchCodec.toParams({
        page: 2,
        pageSize: PAGE_SIZE,
        rideType: RideTypeEnum.EGALITARIAN,
        destination: 'Sorocaba',
      });

      expect(params).toEqual({ pagina: '2', tipo: 'igualitaria', destino: 'Sorocaba' });
    });

    it('should survive a round trip through the url', () => {
      const original = {
        page: 4,
        pageSize: PAGE_SIZE,
        destination: 'Votorantim',
        departureDate: '2026-09-10',
        departureTime: '18:00',
        rideType: RideTypeEnum.SOLIDARITY,
      };

      const params = new URLSearchParams(rideSearchCodec.toParams(original));

      expect(rideSearchCodec.fromParams(params)).toEqual(original);
    });
  });
});
