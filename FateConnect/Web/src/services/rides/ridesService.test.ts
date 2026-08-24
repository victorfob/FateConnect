import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { createRide, deleteRide, listRides, updateRide } from './ridesService';
import { RideTypeEnum } from './types';
import type { RideInput } from './types';

const RIDES_URL = 'https://rides.fateconnect.test/caronas';

const RIDE_INPUT: RideInput = {
  qtdVagas: 3,
  destino: 'Fatec Sorocaba',
  dataPartida: '2026-05-22',
  horaPartida: '07:30',
  tipoCarona: RideTypeEnum.PHILANTHROPIC,
  descricao: 'Saída do centro.',
};

describe('ridesService', () => {
  it('should translate the front filters into the api query parameters', async () => {
    let received: URLSearchParams | null = null;
    server.use(
      http.get(RIDES_URL, ({ request }) => {
        received = new URL(request.url).searchParams;
        return HttpResponse.json([]);
      }),
    );

    await listRides({
      destination: 'Sorocaba',
      departureDate: '2026-08-20',
      departureTime: '07:30',
      rideType: RideTypeEnum.EGALITARIAN,
    });

    expect(received!.get('Destino')).toBe('Sorocaba');
    expect(received!.get('DataPartida')).toBe('2026-08-20');
    expect(received!.get('HoraPartida')).toBe('07:30');
    expect(received!.get('TipoCarona')).toBe(RideTypeEnum.EGALITARIAN);
  });

  it('should omit parameters that were not filled in', async () => {
    let received: URLSearchParams | null = null;
    server.use(
      http.get(RIDES_URL, ({ request }) => {
        received = new URL(request.url).searchParams;
        return HttpResponse.json([]);
      }),
    );

    await listRides({ destination: 'Sorocaba' });

    expect([...received!.keys()]).toEqual(['Destino']);
  });

  it('should list rides without filters', async () => {
    server.use(http.get(RIDES_URL, () => HttpResponse.json([{ id: 1, destino: 'Sorocaba' }])));

    const rides = await listRides();

    expect(rides).toHaveLength(1);
  });

  it('should fail when the response is not a list', async () => {
    server.use(http.get(RIDES_URL, () => HttpResponse.text('<!doctype html><html></html>')));

    await expect(listRides()).rejects.toThrow(/não é uma lista/);
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
