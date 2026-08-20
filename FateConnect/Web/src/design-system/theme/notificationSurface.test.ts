import { describe, expect, it } from 'vitest';

import { colorTokens, colorVariants, darkColorTokens } from '../tokens';
import { createAppTheme } from './createAppTheme';
import { notificationSurface, onNotificationSurface } from './notificationSurface';

const light = createAppTheme('light');
const dark = createAppTheme('dark');

// O produto usa fundo pastel por estado; o padrão da biblioteca é fundo
// saturado com texto branco. Cada par abaixo é uma decisão de aparência.
describe('notificationSurface', () => {
  it('should paint each variant with the product pastel in light mode', () => {
    expect(notificationSurface(light, 'success')).toBe(colorTokens.successBackground);
    expect(notificationSurface(light, 'error')).toBe(colorTokens.dangerBackground);
    expect(notificationSurface(light, 'warning')).toBe(colorTokens.warningBackground);
  });

  it('should invert the pair in dark mode, as the status tag does', () => {
    expect(notificationSurface(dark, 'success')).toBe(darkColorTokens.successTagBackground);
    expect(notificationSurface(dark, 'error')).toBe(darkColorTokens.dangerTagBackground);
    expect(notificationSurface(dark, 'warning')).toBe(darkColorTokens.warningTagBackground);
  });

  it('should write with the state colour in light mode', () => {
    expect(onNotificationSurface(light, 'success')).toBe(colorTokens.successText);
    expect(onNotificationSurface(light, 'warning')).toBe(colorTokens.warningText);
  });

  // O vermelho do produto dá 4.13:1 sobre o pastel; escurecido, 5.79:1.
  it('should darken the error colour so it clears the contrast floor', () => {
    expect(onNotificationSurface(light, 'error')).toBe(colorVariants.secondaryDark);
  });

  it('should write with the light state colour in dark mode', () => {
    expect(onNotificationSurface(dark, 'success')).toBe(darkColorTokens.successTagText);
    expect(onNotificationSurface(dark, 'error')).toBe(darkColorTokens.dangerTagText);
    expect(onNotificationSurface(dark, 'warning')).toBe(darkColorTokens.warningTagText);
  });
});
