import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Logo } from '@/components/Logo';
import { ThemeProviderContext } from '@/components/ThemeProvider';

vi.mock('@chainlit/react-client', async () => {
  const { createContext } = await import('react');
  return {
    ChainlitContext: createContext({
      getLogoEndpoint: (theme: string) => `/logo?theme=${theme}`
    }),
    useConfig: () => ({ config: { ui: {} } })
  };
});

const originalMatchMedia = window.matchMedia;

describe('Logo', () => {
  beforeEach(() => {
    // The OS prefers dark mode.
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('uses the theme of a provider sharing the context, not the OS preference', () => {
    // What the copilot does: provide ThemeProviderContext from its own provider.
    render(
      <ThemeProviderContext.Provider
        value={{ theme: 'light', setTheme: () => null }}
      >
        <Logo />
      </ThemeProviderContext.Provider>
    );

    expect(screen.getByAltText('logo')).toHaveAttribute(
      'src',
      '/logo?theme=light'
    );
  });

  it('follows the OS preference when the theme is system', () => {
    render(
      <ThemeProviderContext.Provider
        value={{ theme: 'system', setTheme: () => null }}
      >
        <Logo />
      </ThemeProviderContext.Provider>
    );

    expect(screen.getByAltText('logo')).toHaveAttribute(
      'src',
      '/logo?theme=dark'
    );
  });
});
