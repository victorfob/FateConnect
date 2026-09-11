import { LostItemKindEnum, LostItemStatusEnum } from '@app/services/lostAndFound/types';
import { FIRST_PAGE, PAGE_SIZE } from '@app/utils/searchParams';

import { DEFAULT_STATUS, lostItemSearchCodec } from './searchQuery';

const read = (search: string) => lostItemSearchCodec.fromParams(new URLSearchParams(search));

describe('lostItemSearchCodec', () => {
  describe('fromParams', () => {
    it('should open the board on the default status when the url is empty', () => {
      expect(read('')).toEqual({ page: FIRST_PAGE, pageSize: PAGE_SIZE, status: DEFAULT_STATUS });
    });

    it('should read every filter the url carries', () => {
      expect(
        read(
          'pagina=2&busca=Garrafa&de=2026-08-01&ate=2026-08-05&tipo=perdido&situacao=resolvido&meus=sim',
        ),
      ).toEqual({
        page: 2,
        pageSize: PAGE_SIZE,
        searchTerm: 'Garrafa',
        dateFrom: '2026-08-01',
        dateTo: '2026-08-05',
        lostAndFoundType: LostItemKindEnum.LOST,
        status: LostItemStatusEnum.RESOLVED,
        onlyMine: true,
      });
    });

    it('should take one end of the period without the other', () => {
      expect(read('de=2026-08-01')).toMatchObject({ dateFrom: '2026-08-01' });
      expect(read('ate=2026-08-05')).toMatchObject({ dateTo: '2026-08-05' });
    });

    // O período substituiu a data fixa: link antigo salvo deixa de restaurar, e
    // o que ele carrega não pode quebrar a tela.
    it('should ignore the parameter the filter no longer knows', () => {
      expect(read('data=2026-08-01')).toEqual({
        page: FIRST_PAGE,
        pageSize: PAGE_SIZE,
        status: DEFAULT_STATUS,
      });
    });

    it.each(['pagina=0', 'pagina=-2', 'pagina=xis'])(
      'should fall back to the first page when the url says %s',
      (search) => {
        expect(read(search).page).toBe(FIRST_PAGE);
      },
    );

    it('should ask for every status when the url says so, which the default cannot express', () => {
      expect(read('situacao=todas').status).toBeUndefined();
    });

    it('should fall back to the default status when the url names one it does not know', () => {
      expect(read('situacao=extraviado').status).toBe(DEFAULT_STATUS);
    });

    // A palavra da ação mudou e não há retroatividade: o link antigo cai no padrão.
    it('should no longer answer to the word the deletion used to have', () => {
      expect(read('situacao=cancelado').status).toBe(DEFAULT_STATUS);
    });

    it('should ignore a kind it does not recognise', () => {
      expect(read('tipo=emprestado').lostAndFoundType).toBeUndefined();
    });

    it('should not care about the case of the words', () => {
      expect(read('tipo=ACHADO&situacao=Excluido')).toMatchObject({
        lostAndFoundType: LostItemKindEnum.FOUND,
        status: LostItemStatusEnum.DELETED,
      });
    });

    it.each(['meus=nao', 'meus=', 'meus=talvez'])(
      'should leave "only mine" off when the url says %s',
      (search) => {
        expect(read(search).onlyMine).toBeUndefined();
      },
    );
  });

  describe('toParams', () => {
    it('should keep the defaults out of the url', () => {
      const params = lostItemSearchCodec.toParams({
        page: FIRST_PAGE,
        pageSize: PAGE_SIZE,
        status: DEFAULT_STATUS,
      });

      expect(params).toEqual({});
    });

    it('should name every status in the url, so it survives a reload', () => {
      const params = lostItemSearchCodec.toParams({ page: FIRST_PAGE, pageSize: PAGE_SIZE });

      expect(params).toEqual({ situacao: 'todas' });
      expect(read('situacao=todas').status).toBeUndefined();
    });

    it('should write the words the screen shows', () => {
      const params = lostItemSearchCodec.toParams({
        page: 3,
        pageSize: PAGE_SIZE,
        lostAndFoundType: LostItemKindEnum.FOUND,
        status: LostItemStatusEnum.DELETED,
        onlyMine: true,
      });

      expect(params).toEqual({ pagina: '3', tipo: 'achado', situacao: 'excluido', meus: 'sim' });
    });

    it('should survive a round trip through the url', () => {
      const original = {
        page: 4,
        pageSize: PAGE_SIZE,
        searchTerm: 'Guarda-chuva azul',
        dateFrom: '2026-07-15',
        dateTo: '2026-07-20',
        lostAndFoundType: LostItemKindEnum.LOST,
        status: LostItemStatusEnum.RESOLVED,
        onlyMine: true,
      };

      const params = new URLSearchParams(lostItemSearchCodec.toParams(original));

      expect(lostItemSearchCodec.fromParams(params)).toEqual(original);
    });
  });
});
