import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { renderHook, waitFor } from '@app/test/testing-library';

import { useStoredImage } from './useStoredImage';

const STORED_PATH = 'uploads/user/thumbnails/perfil.webp';
const STORED_URL = `https://api.fateconnect.test/${STORED_PATH}`;
const OBJECT_URL = 'blob:https://fateconnect.test/perfil';
/** Basta ser corpo binário: o que o hook usa é o blob que o cliente devolve. */
const WEBP_BYTES = 'RIFF\0\0\0\0WEBP';

const SERVER_ERROR = 500;

function storedImageAnswering(status = 200) {
  server.use(
    http.get(STORED_URL, () => {
      if (status !== 200) return new HttpResponse(null, { status });

      return new HttpResponse(WEBP_BYTES, { headers: { 'Content-Type': 'image/webp' } });
    }),
  );
}

describe('useStoredImage', () => {
  beforeEach(() => {
    // jsdom não implementa a fábrica de URL de objeto, e é dela que sai a foto.
    URL.createObjectURL = vi.fn(() => OBJECT_URL);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should report neither an image nor a load when there is no address', () => {
    const { result } = renderHook(() => useStoredImage(null));

    expect(result.current).toEqual({ image: null, loading: false });
  });

  it('should report the load until the image arrives, then the image', async () => {
    storedImageAnswering();

    const { result } = renderHook(() => useStoredImage(STORED_PATH));

    expect(result.current).toEqual({ image: null, loading: true });
    await waitFor(() =>
      expect(result.current).toEqual({
        image: { objectUrl: OBJECT_URL, contentType: 'image/webp' },
        loading: false,
      }),
    );
  });

  it('should end the load without an image when the download fails', async () => {
    storedImageAnswering(SERVER_ERROR);

    const { result } = renderHook(() => useStoredImage(STORED_PATH));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current).toEqual({ image: null, loading: false }));
  });
});
