import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { createRide, deleteRide, listRides, updateRide } from './ridesService';
import { RideTypeEnum, type RideInput } from './types';

const RIDES_URL = 'https://api.fateconnect.test/rides';
const FIRST_PAGE = 1;
const SINGLE_PAGE = 1;
const PAGE_SIZE = 10;

const RIDE_INPUT: RideInput = {
  availableSeats: 3,
  destination: 'Fatec Sorocaba',
  departureDate: '2026-05-22',
  departureTime: '07:30',
  rideType: RideTypeEnum.SOLIDARITY,
  description: 'Saída do centro.',
};

function pageOf(items: unknown[]) {
  return {
    items,
    page: FIRST_PAGE,
    pageSize: PAGE_SIZE,
    total: items.length,
    totalPages: SINGLE_PAGE,
  };
}

describe('ridesService', () => {
  it('should translate the front filters into the api query parameters', async () => {
    let received: URLSearchParams | null = null;
    server.use(
      http.get(RIDES_URL, ({ request }) => {
        received = new URL(request.url).searchParams;
        return HttpResponse.json(pageOf([]));
      }),
    );

    await listRides({
      destination: 'Sorocaba',
      departureDate: '2026-08-20',
      departureTime: '07:30',
      rideType: RideTypeEnum.EGALITARIAN,
    });

    expect(received!.get('destination')).toBe('Sorocaba');
    expect(received!.get('departureDate')).toBe('2026-08-20');
    expect(received!.get('departureTime')).toBe('07:30');
    expect(received!.get('rideType')).toBe(RideTypeEnum.EGALITARIAN);
  });

  it('should send the page and the page size the caller asked for', async () => {
    let received: URLSearchParams | null = null;
    server.use(
      http.get(RIDES_URL, ({ request }) => {
        received = new URL(request.url).searchParams;
        return HttpResponse.json(pageOf([]));
      }),
    );

    await listRides({ page: 3, pageSize: 10 });

    expect(received!.get('page')).toBe('3');
    expect(received!.get('pageSize')).toBe('10');
  });

  it('should omit parameters that were not filled in', async () => {
    let received: URLSearchParams | null = null;
    server.use(
      http.get(RIDES_URL, ({ request }) => {
        received = new URL(request.url).searchParams;
        return HttpResponse.json(pageOf([]));
      }),
    );

    await listRides({ destination: 'Sorocaba' });

    expect([...received!.keys()]).toEqual(['destination']);
  });

  it('should list rides without filters', async () => {
    server.use(
      http.get(RIDES_URL, () => HttpResponse.json(pageOf([{ id: 1, destination: 'Sorocaba' }]))),
    );

    const page = await listRides();

    expect(page.items).toHaveLength(1);
    expect(page.totalPages).toBe(SINGLE_PAGE);
  });

  it('should fail when the response is not a page', async () => {
    server.use(http.get(RIDES_URL, () => HttpResponse.text('<!doctype html><html></html>')));

    await expect(listRides()).rejects.toThrow(/não é uma página/);
  });

  it('should send the whole ride when creating', async () => {
    let body: RideInput | null = null;
    server.use(
      http.post(RIDES_URL, async ({ request }) => {
        body = (await request.json()) as RideInput;
        return HttpResponse.json({ id: 'new' }, { status: 201 });
      }),
    );

    await createRide(RIDE_INPUT);

    expect(body).toEqual(RIDE_INPUT);
  });

  it('should send the whole ride when updating, so the description survives', async () => {
    let body: RideInput | null = null;
    let updatedId: string | undefined;
    server.use(
      http.put(`${RIDES_URL}/:id`, async ({ request, params }) => {
        updatedId = params.id as string;
        body = (await request.json()) as RideInput;
        return HttpResponse.json({ id: params.id });
      }),
    );

    await updateRide('c7d2', RIDE_INPUT);

    expect(updatedId).toBe('c7d2');
    expect(body).toEqual(RIDE_INPUT);
  });

  it('should delete a ride by id', async () => {
    let deletedId: string | undefined;
    server.use(
      http.delete(`${RIDES_URL}/:id`, ({ params }) => {
        deletedId = params.id as string;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await deleteRide('7');

    expect(deletedId).toBe('7');
  });
});
