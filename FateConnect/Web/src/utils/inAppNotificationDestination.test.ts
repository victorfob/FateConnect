import { archivedItemsPath, rideSearchPath } from './inAppNotificationDestination';

describe('inAppNotificationDestination', () => {
  it('should lead to the archived items of whoever got the notice', () => {
    const url = new URL(archivedItemsPath(), 'https://fateconnect.test');

    expect(url.pathname).toBe('/achados-perdidos');
    expect(Object.fromEntries(url.searchParams)).toEqual({ meus: 'sim', situacao: 'arquivado' });
  });

  it('should lead to the rides searched by the destination, encoded', () => {
    const url = new URL(rideSearchPath('Fatec Sorocaba & Centro'), 'https://fateconnect.test');

    expect(url.pathname).toBe('/caronas');
    expect(Object.fromEntries(url.searchParams)).toEqual({ busca: 'Fatec Sorocaba & Centro' });
  });
});
