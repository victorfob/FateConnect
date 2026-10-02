import { contactBannerStorage } from './contactBannerStorage';

const TOKEN = 'cabecalho.carga.assinatura-da-sessao';

describe('contactBannerStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('should remember the dismissal for the session that made it', () => {
    contactBannerStorage.dismissFor(TOKEN);

    expect(contactBannerStorage.isDismissedFor(TOKEN)).toBe(true);
    expect(contactBannerStorage.isDismissedFor('cabecalho.carga.outra-sessao')).toBe(false);
  });

  it('should neither read nor write without a session', () => {
    contactBannerStorage.dismissFor(null);

    expect(window.localStorage.length).toBe(0);
    expect(contactBannerStorage.isDismissedFor(null)).toBe(false);
  });
});
