import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { fetchStoredImage } from './uploadsService';

describe('fetchStoredImage', () => {
  // A API devolve o endereço da foto relativo e sem barra inicial, então ele tem
  // de cair sob a base da API — sob o endereço do site, o nginx responde o
  // index.html do front com 200 e nem 404 aparece no log.
  it('should fetch the stored image under the api base address', async () => {
    let requestUrl: string | null = null;
    server.use(
      http.get('https://api.fateconnect.test/uploads/:module/:file', ({ request }) => {
        requestUrl = request.url;

        return new HttpResponse('bytes', { headers: { 'Content-Type': 'image/png' } });
      }),
    );

    const image = await fetchStoredImage('uploads/denunciations/foto.png');

    expect(requestUrl).toBe('https://api.fateconnect.test/uploads/denunciations/foto.png');
    expect(image.type).toBe('image/png');
  });
});
