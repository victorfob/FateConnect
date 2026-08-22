import { describe, expect, it } from 'vitest';

import { colorTokens, colorVariants, darkColorTokens } from '../tokens';
import { createAppTheme } from './createAppTheme';
import { onStatusTagSurface, statusTagSurface } from './statusTagSurface';

const light = createAppTheme('light');
const dark = createAppTheme('dark');

describe('statusTagSurface', () => {
  it('should paint each tone with the product pastel in light mode', () => {
    expect(statusTagSurface(light, 'muted')).toBe(colorTokens.mutedBackground);
    expect(statusTagSurface(light, 'success')).toBe(colorTokens.successBackground);
    expect(statusTagSurface(light, 'warning')).toBe(colorTokens.warningBackground);
    expect(statusTagSurface(light, 'danger')).toBe(colorTokens.dangerBackground);
  });

  it('should invert the pair in dark mode, keeping each role', () => {
    expect(statusTagSurface(dark, 'muted')).toBe(darkColorTokens.mutedTagBackground);
    expect(statusTagSurface(dark, 'success')).toBe(darkColorTokens.successTagBackground);
    expect(statusTagSurface(dark, 'warning')).toBe(darkColorTokens.warningTagBackground);
    expect(statusTagSurface(dark, 'danger')).toBe(darkColorTokens.dangerTagBackground);
  });

  it('should write with the state colour in light mode', () => {
    expect(onStatusTagSurface(light, 'muted')).toBe(colorTokens.mutedText);
    expect(onStatusTagSurface(light, 'success')).toBe(colorTokens.successText);
    expect(onStatusTagSurface(light, 'warning')).toBe(colorTokens.warningText);
  });

  // O vermelho do produto dá 4.13:1 sobre o pastel; escurecido, 5.79:1 — a
  // mesma cor que o aviso de erro usa, para os dois vermelhos não divergirem.
  it('should reuse the darkened error colour on the danger tone', () => {
    expect(onStatusTagSurface(light, 'danger')).toBe(colorVariants.secondaryDark);
  });

  it('should write with the light state colour in dark mode', () => {
    expect(onStatusTagSurface(dark, 'muted')).toBe(darkColorTokens.mutedTagText);
    expect(onStatusTagSurface(dark, 'success')).toBe(darkColorTokens.successTagText);
    expect(onStatusTagSurface(dark, 'warning')).toBe(darkColorTokens.warningTagText);
    expect(onStatusTagSurface(dark, 'danger')).toBe(darkColorTokens.dangerTagText);
  });

  // O valor desconhecido aparece como texto corrido, sem caixa; estado que
  // precisa parecer etiqueta usa `muted`.
  it('should leave the neutral tone without a surface, in both themes', () => {
    expect(statusTagSurface(light, 'neutral')).toBe('transparent');
    expect(statusTagSurface(dark, 'neutral')).toBe('transparent');
    expect(onStatusTagSurface(light, 'neutral')).toBe('inherit');
    expect(onStatusTagSurface(dark, 'neutral')).toBe('inherit');
  });
});
