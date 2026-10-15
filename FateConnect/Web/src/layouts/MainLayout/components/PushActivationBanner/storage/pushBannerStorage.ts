const DISMISSED_KEY = 'push_banner_dismissed';
const DISMISSED = 'sim';

/** A dispensa é do aparelho, não da conta: quem dispensou não vê o aviso de novo nele. */
export const pushBannerStorage = {
  isDismissed(): boolean {
    return window.localStorage.getItem(DISMISSED_KEY) === DISMISSED;
  },

  dismiss(): void {
    window.localStorage.setItem(DISMISSED_KEY, DISMISSED);
  },
};
