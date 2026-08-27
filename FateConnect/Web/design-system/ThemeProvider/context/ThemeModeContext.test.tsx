import { renderHook } from '@testing-library/react';

import { useThemeMode } from './ThemeModeContext';

describe('useThemeMode', () => {
  it('should fail loudly when used outside the provider', () => {
    expect(() => renderHook(() => useThemeMode())).toThrow(/ThemeProvider/);
  });
});
