import { chromeSurface, onChromeSurface } from './chromeSurface';
import { AA_NORMAL_TEXT, contrastRatio } from './contrast';
import { createAppTheme } from './createAppTheme';
import { notificationSurface, onNotificationSurface } from './notificationSurface';
import { onStatusTagSurface, statusTagSurface } from './statusTagSurface';

const lightTheme = createAppTheme('light');
const darkTheme = createAppTheme('dark');

describe('contrastRatio', () => {
  it('should return the known ratios for the reference pairs', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 1);
  });

  it('should flatten a translucent colour over its background before measuring', () => {
    // Branco a 50% sobre preto equivale a um cinza médio, não a branco puro.
    const meioBranco = contrastRatio('rgba(255, 255, 255, 0.5)', '#000000');

    expect(meioBranco).toBeLessThan(contrastRatio('#FFFFFF', '#000000'));
    expect(meioBranco).toBeGreaterThan(1);
  });

  it('should accept an rgb colour without an alpha channel', () => {
    expect(contrastRatio('rgb(255, 255, 255)', '#000000')).toBeCloseTo(21, 1);
  });

  it('should reject a colour it cannot read', () => {
    expect(() => contrastRatio('vermelho', '#FFFFFF')).toThrow(/não reconhecida/);
  });
});

describe('light theme contrast', () => {
  const { palette } = lightTheme;

  it.each([
    ['body text on the page background', palette.text.primary, palette.background.default],
    ['body text on a surface', palette.text.primary, palette.background.paper],
    ['secondary text on a surface', palette.text.secondary, palette.background.paper],
    ['content on the primary colour', palette.primary.contrastText, palette.primary.main],
    ['content on the secondary colour', palette.secondary.contrastText, palette.secondary.main],
    ['content on the error colour', palette.error.contrastText, palette.error.main],
    ['content on the app chrome', onChromeSurface(lightTheme), chromeSurface(lightTheme)],
    ['a muted tag', onStatusTagSurface(lightTheme, 'muted'), statusTagSurface(lightTheme, 'muted')],
    [
      'a success tag',
      onStatusTagSurface(lightTheme, 'success'),
      statusTagSurface(lightTheme, 'success'),
    ],
    [
      'a warning tag',
      onStatusTagSurface(lightTheme, 'warning'),
      statusTagSurface(lightTheme, 'warning'),
    ],
    [
      'a danger tag',
      onStatusTagSurface(lightTheme, 'danger'),
      statusTagSurface(lightTheme, 'danger'),
    ],
    [
      'a success notification',
      onNotificationSurface(lightTheme, 'success'),
      notificationSurface(lightTheme, 'success'),
    ],
    [
      'an error notification',
      onNotificationSurface(lightTheme, 'error'),
      notificationSurface(lightTheme, 'error'),
    ],
    [
      'a warning notification',
      onNotificationSurface(lightTheme, 'warning'),
      notificationSurface(lightTheme, 'warning'),
    ],
  ])('should meet AA for %s', (_, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});

describe('dark theme contrast', () => {
  const { palette } = darkTheme;

  it.each([
    ['body text on the page background', palette.text.primary, palette.background.default],
    ['body text on an elevated surface', palette.text.primary, palette.background.paper],
    ['secondary text on the page background', palette.text.secondary, palette.background.default],
    ['the primary colour on the background', palette.primary.main, palette.background.default],
    ['the secondary colour on the background', palette.secondary.main, palette.background.default],
    ['content on the secondary colour', palette.secondary.contrastText, palette.secondary.main],
    ['the error colour on the background', palette.error.main, palette.background.default],
    ['content on the app chrome', onChromeSurface(darkTheme), chromeSurface(darkTheme)],
    ['a muted tag', onStatusTagSurface(darkTheme, 'muted'), statusTagSurface(darkTheme, 'muted')],
    [
      'a success tag',
      onStatusTagSurface(darkTheme, 'success'),
      statusTagSurface(darkTheme, 'success'),
    ],
    [
      'a warning tag',
      onStatusTagSurface(darkTheme, 'warning'),
      statusTagSurface(darkTheme, 'warning'),
    ],
    [
      'a danger tag',
      onStatusTagSurface(darkTheme, 'danger'),
      statusTagSurface(darkTheme, 'danger'),
    ],
    [
      'a success notification',
      onNotificationSurface(darkTheme, 'success'),
      notificationSurface(darkTheme, 'success'),
    ],
    [
      'an error notification',
      onNotificationSurface(darkTheme, 'error'),
      notificationSurface(darkTheme, 'error'),
    ],
    [
      'a warning notification',
      onNotificationSurface(darkTheme, 'warning'),
      notificationSurface(darkTheme, 'warning'),
    ],
  ])('should meet AA for %s', (_, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});
