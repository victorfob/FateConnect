import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useThemeMode } from './ThemeModeContext';

describe('useThemeMode', () => {
  it('should fail loudly when used outside the provider', () => {
    expect(() => renderHook(() => useThemeMode())).toThrow(/ThemeProvider/);
  });
});
