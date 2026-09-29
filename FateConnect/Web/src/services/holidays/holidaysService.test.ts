import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { listHolidays } from './holidaysService';

const HOLIDAYS_URL = 'https://api.fateconnect.test/holidays';
const YEAR = 2026;
const HOLIDAYS = ['2026-01-01', '2026-02-16'];

describe('holidaysService', () => {
  it('should ask the api for the holidays of the year and answer the dates', async () => {
    let received: string | null = null;
    server.use(
      http.get(HOLIDAYS_URL, ({ request }) => {
        received = new URL(request.url).searchParams.get('year');
        return HttpResponse.json(HOLIDAYS);
      }),
    );

    const holidays = await listHolidays(YEAR);

    expect(received).toBe(String(YEAR));
    expect(holidays).toEqual(HOLIDAYS);
  });

  it('should refuse an answer that is not a list of dates', async () => {
    server.use(http.get(HOLIDAYS_URL, () => HttpResponse.text('<!doctype html>')));

    await expect(listHolidays(YEAR)).rejects.toThrow();
  });
});
