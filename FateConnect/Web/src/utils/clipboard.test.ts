import { afterEach, describe, expect, it, vi } from 'vitest';

import { copyToClipboard } from './clipboard';

function stubClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
}

describe('copyToClipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  });

  it('should report the copy when the browser accepts it', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    stubClipboard(writeText);

    await expect(copyToClipboard('maria@example.com')).resolves.toBe(true);

    expect(writeText).toHaveBeenCalledWith('maria@example.com');
  });

  it('should report the failure when the browser refuses', async () => {
    stubClipboard(() => Promise.reject(new Error('denied')));

    await expect(copyToClipboard('maria@example.com')).resolves.toBe(false);
  });

  it('should report the failure when there is no clipboard at all', async () => {
    // Fora de contexto seguro o navegador não expõe a API.
    await expect(copyToClipboard('maria@example.com')).resolves.toBe(false);
  });
});
