import { colorTokens, darkColorTokens } from '../tokens';
import { chromeDivider, chromeSurface, inputOutline, onChromeSurface } from './chromeSurface';
import { createAppTheme } from './createAppTheme';

const light = createAppTheme('light');
const dark = createAppTheme('dark');

// O cromo (topo, rodapé, menu lateral) troca de estratégia entre os temas: no
// claro é a cor de marca; no escuro, superfície elevada neutra. Cada função
// abaixo é uma decisão de produto, e o teste é o que impede que ela se inverta.
describe('chromeSurface helpers', () => {
  it('should paint the chrome with the brand color in light and with an elevated surface in dark', () => {
    expect(chromeSurface(light)).toBe(light.palette.primary.main);
    expect(chromeSurface(dark)).toBe(dark.palette.background.paper);
  });

  it('should take the content color from the pair that matches the chrome background', () => {
    expect(onChromeSurface(light)).toBe(light.palette.primary.contrastText);
    expect(onChromeSurface(dark)).toBe(dark.palette.text.primary);
  });

  it('should use a light divider over the brand color and the neutral one in dark', () => {
    expect(chromeDivider(light)).toBe(colorTokens.chromeDivider);
    expect(chromeDivider(dark)).toBe(darkColorTokens.divider);
  });

  it('should outline the field at the product opacity, not at the mui default', () => {
    expect(inputOutline(light)).toBe(colorTokens.inputOutline);
    expect(inputOutline(dark)).toBe(darkColorTokens.onSurfaceDisabled);
  });
});
