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

/**
 * As superfícies em que qualquer conteúdo pode cair. Toda cor de conteúdo é
 * medida contra **todas** elas: o defeito que originou este formato era uma cor
 * antiga aterrissando numa superfície que ninguém tinha medido, e um tema
 * cobrindo o par que faltava no outro.
 */
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

/** Cor que só delimita um controle: vale o limite de não-texto, não o de texto. */
function nonTextColours(theme: Theme): [string, string][] {
  return [
    ['the field outline', theme.palette.inputOutline],
    ['the button fill', theme.palette.secondary.main],
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

/** Pares em que o fundo é fixo pelo próprio componente, sem produto cartesiano. */
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
  it.each([...against(theme, contentColours), ...boundPairs(theme)])(
    'should meet AA for %s',
    (_name, foreground, background) => {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    },
  );

  it.each(against(theme, nonTextColours))(
    'should meet the non-text threshold for %s',
    (_name, foreground, background) => {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    },
  );
});
