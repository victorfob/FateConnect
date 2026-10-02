import Typography from '@mui/material/Typography';

import { act, render, screen, userEvent } from '@app/test/testing-library';

import { createAppTheme } from '../theme';
import type { ThemePreference } from './@types/themePreference';
import { useThemeMode } from './context/ThemeModeContext';
import { themeModeStorage } from './storage/themeModeStorage';

const DARK_SCHEME_QUERY = 'prefers-color-scheme: dark';
const LIGHT_CHROME = createAppTheme('light').palette.chrome.main;
const DARK_CHROME = createAppTheme('dark').palette.chrome.main;

const systemScheme = { dark: false };
const schemeListeners = new Set<VoidFunction>();

/** O jsdom não tem `matchMedia`: este faz as vezes do tema do aparelho, que o caso troca. */
function stubSystemScheme() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query.includes(DARK_SCHEME_QUERY) && systemScheme.dark;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: VoidFunction) => schemeListeners.add(listener),
    removeEventListener: (_type: string, listener: VoidFunction) =>
      schemeListeners.delete(listener),
    addListener: (listener: VoidFunction) => schemeListeners.add(listener),
    removeListener: (listener: VoidFunction) => schemeListeners.delete(listener),
    dispatchEvent: vi.fn(),
  }));
}

function systemSwitchesTo(dark: boolean) {
  systemScheme.dark = dark;
  act(() => schemeListeners.forEach((listener) => listener()));
}

/**
 * A sonda vive aqui porque nenhum componente do design system escolhe o tema: o
 * menu mora na aplicação, e daqui não se importa de `@app`.
 */
function ModeProbe() {
  const { mode, preference, choosePreference } = useThemeMode();
  const choices: ThemePreference[] = ['system', 'light', 'dark'];

  return (
    <>
      <output aria-label="modo">{mode}</output>
      <output aria-label="preferência">{preference}</output>
      {choices.map((choice) => (
        <button key={choice} onClick={() => choosePreference(choice)}>
          {choice}
        </button>
      ))}
    </>
  );
}

const shownMode = () => screen.getByRole('status', { name: 'modo' });

const choose = (choice: ThemePreference) =>
  userEvent.click(screen.getByRole('button', { name: choice }));

function addThemeColorTags() {
  for (const media of ['(prefers-color-scheme: light)', '(prefers-color-scheme: dark)']) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.media = media;
    meta.content = LIGHT_CHROME;
    document.head.append(meta);
  }
}

const themeColors = () =>
  [...document.querySelectorAll('meta[name="theme-color"]')].map((meta) =>
    meta.getAttribute('content'),
  );

describe('ThemeProvider', () => {
  beforeEach(() => stubSystemScheme());

  afterEach(() => {
    vi.unstubAllGlobals();
    systemScheme.dark = false;
    schemeListeners.clear();
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
  });

  it('should provide the theme to components in the tree', () => {
    render(<Typography variant="logo">FateConnect</Typography>);

    const element = screen.getByText('FateConnect');

    expect(element).toBeInTheDocument();
    expect(getComputedStyle(element).fontSize).toBe('1.3rem');
  });

  it('should open in the mode chosen on the last visit, whatever the device is in', () => {
    systemScheme.dark = true;
    themeModeStorage.save('light');

    render(<ModeProbe />);

    expect(shownMode()).toHaveTextContent('light');
  });

  it('should follow the device when nothing was chosen, and change along with it', () => {
    systemScheme.dark = true;
    render(<ModeProbe />);

    expect(shownMode()).toHaveTextContent('dark');
    expect(screen.getByRole('status', { name: 'preferência' })).toHaveTextContent('system');

    systemSwitchesTo(false);

    expect(shownMode()).toHaveTextContent('light');
  });

  // Sem esta declaração o Chrome desenha todo controle nativo no claro, por mais
  // escuro que o tema esteja — e nada no produto acusa.
  it('should tell the browser which scheme to draw its own controls in', () => {
    themeModeStorage.save('dark');

    render(<ModeProbe />);

    expect(getComputedStyle(document.documentElement).colorScheme).toBe('dark');
  });

  it('should remember a chosen mode, and forget it when the device is followed again', async () => {
    render(<ModeProbe />);

    await choose('dark');

    expect(themeModeStorage.read()).toBe('dark');
    expect(shownMode()).toHaveTextContent('dark');

    await choose('system');

    expect(themeModeStorage.read()).toBeNull();
    expect(shownMode()).toHaveTextContent('light');
  });

  it('should paint the browser bars with the top bar colour of the mode in use', async () => {
    addThemeColorTags();
    render(<ModeProbe />);

    expect(themeColors()).toEqual([LIGHT_CHROME, LIGHT_CHROME]);

    await choose('dark');

    expect(themeColors()).toEqual([DARK_CHROME, DARK_CHROME]);
  });
});
