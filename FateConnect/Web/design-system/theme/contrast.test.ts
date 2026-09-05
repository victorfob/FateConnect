import type { Theme } from '@mui/material/styles';

import { AA_NON_TEXT, AA_NORMAL_TEXT, contrastRatio } from './contrast';
import { createAppTheme } from './createAppTheme';
import type { NotificationVariant, StatusTagTone } from './types';

const lightTheme = createAppTheme('light');
const darkTheme = createAppTheme('dark');

describe('contrastRatio', () => {
  it('should return the known ratios for the reference pairs', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 1);
  });

  it('should read the three-digit hex the library writes', () => {
    expect(contrastRatio('#fff', '#000000')).toBeCloseTo(21, 1);
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

type Par = [string, string, string];

const TRANSPARENT = 'transparent';

/** Toda cor de conteúdo é medida contra **todas** as superfícies daqui. */
function surfaces(theme: Theme): [string, string][] {
  return [
    ['the page background', theme.palette.background.default],
    ['a surface', theme.palette.background.paper],
  ];
}

/** Cor que o usuário lê. Acrescentar aqui já a mede contra todas as superfícies. */
function contentColours(theme: Theme): [string, string][] {
  return [
    ['body text', theme.palette.text.primary],
    ['secondary text', theme.palette.text.secondary],
    ['brand text', theme.palette.brandText],
    ['error text', theme.palette.error.main],
  ];
}

function nonTextColours(theme: Theme): [string, string][] {
  return [
    ['the field outline', theme.palette.inputOutline],
    ['the button fill', theme.palette.secondary.main],
    ['the loading skeleton', theme.palette.skeleton],
    ['the switch track', theme.palette.switchTrack],
  ];
}

/**
 * A superfície flutuante não entra em `surfaces` porque não carrega tudo: botão
 * preenchido não vai dentro de menu, e erro nesta casa sai como notificação, que
 * tem superfície própria. O que ela carrega é texto, a marca e o esqueleto — e
 * é o mesmo tratamento que o cromo recebe, também por par explícito.
 *
 * ⛔ Pôr conteúdo novo no popover ancorado obriga a acrescentar o par aqui.
 */
function floatingSurfaceText(theme: Theme): Par[] {
  const { palette } = theme;

  return [
    ['body text on a floating surface', palette.text.primary, palette.surfaceFloating],
    ['secondary text on a floating surface', palette.text.secondary, palette.surfaceFloating],
    ['brand text on a floating surface', palette.brandText, palette.surfaceFloating],
  ];
}

/**
 * O campo preenchido pelo navegador carrega texto, então precisa do par. No
 * claro o valor é `transparent` de propósito — quem pinta ali é o navegador, e
 * não há cor nossa para medir.
 */
function autofilledFieldText(theme: Theme): Par[] {
  const { palette } = theme;
  if (palette.inputAutofill === TRANSPARENT) return [];

  return [['body text on an autofilled field', palette.text.primary, palette.inputAutofill]];
}

function floatingSurfaceNonText(theme: Theme): Par[] {
  return [
    [
      'the loading skeleton on a floating surface',
      theme.palette.skeleton,
      theme.palette.surfaceFloating,
    ],
  ];
}

function against(theme: Theme, colours: (theme: Theme) => [string, string][]): Par[] {
  return colours(theme).flatMap(([content, foreground]) =>
    surfaces(theme).map(([surface, background]): Par => [
      `${content} on ${surface}`,
      foreground,
      background,
    ]),
  );
}

function boundPairs(theme: Theme): Par[] {
  const { palette } = theme;
  const tones: StatusTagTone[] = ['muted', 'success', 'warning', 'danger'];
  const variants: NotificationVariant[] = ['success', 'error', 'warning'];

  return [
    ['content on the app chrome', palette.chrome.contrastText, palette.chrome.main],
    ['content on the secondary colour', palette.secondary.contrastText, palette.secondary.main],
    ...tones.map((tone): Par => [
      `a ${tone} tag`,
      palette.statusTag[tone].content,
      palette.statusTag[tone].surface,
    ]),
    ...variants.map((variant): Par => [
      `a ${variant} notification`,
      palette.notification[variant].content,
      palette.notification[variant].surface,
    ]),
  ];
}

describe.each([
  ['light', lightTheme],
  ['dark', darkTheme],
])('%s theme contrast', (_, theme) => {
  it.each([
    ...against(theme, contentColours),
    ...boundPairs(theme),
    ...floatingSurfaceText(theme),
    ...autofilledFieldText(theme),
  ])('should meet AA for %s', (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it.each([...against(theme, nonTextColours), ...floatingSurfaceNonText(theme)])(
    'should meet the non-text threshold for %s',
    (_name, foreground, background) => {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    },
  );

  // O logotipo é isento do mínimo da WCAG, então não há limite a cobrar dele — e
  // um limite que não se exige não entra na lista acima só para parecer medido.
  // O que se cobra é o que a escolha decidiu: sobre o cromo, a marca nunca é
  // menos legível do que o vermelho de botão seria ali.
  it('should keep the brand mark on the chrome at least as legible as the button red', () => {
    const { palette } = theme;

    expect(contrastRatio(palette.chrome.accent, palette.chrome.main)).toBeGreaterThanOrEqual(
      contrastRatio(palette.secondary.main, palette.chrome.main),
    );
  });
});
