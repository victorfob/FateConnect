import { themeModeStorage } from './themeModeStorage';

describe('themeModeStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should read back the mode it saved', () => {
    themeModeStorage.save('dark');

    expect(themeModeStorage.read()).toBe('dark');
  });

  it('should report no choice when nothing was saved', () => {
    expect(themeModeStorage.read()).toBeNull();
  });

  it('should ignore a stored value that is not a theme mode', () => {
    window.localStorage.setItem('theme_mode', 'sepia');

    expect(themeModeStorage.read()).toBeNull();
  });
});
