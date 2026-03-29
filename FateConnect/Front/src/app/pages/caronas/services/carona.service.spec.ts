import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { CaronaService } from './carona.service';

describe('CaronaService', () => {
  let service: CaronaService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/caronas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CaronaService,
      ],
    });
    service = TestBed.inject(CaronaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve GET em /caronas sem query quando não há filtros', () => {
    service.listarCaronas().subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush([]);
  });

  it('deve enviar query params alinhados ao FilterCaronaDto', () => {
    service
      .listarCaronas({
        destino: '  Campus  ',
        data: '2025-03-01',
        hora: '08:30',
        caronaType: 'Filantropica',
      })
      .subscribe();

    const req = httpMock.expectOne((r) => r.url.startsWith(baseUrl));
    expect(req.request.params.get('Destino')).toBe('  Campus  ');
    expect(req.request.params.get('DataPartida')).toBe('2025-03-01');
    expect(req.request.params.get('HoraPartida')).toBe('08:30');
    expect(req.request.params.get('TipoCarona')).toBe('Filantropica');
    req.flush([]);
  });

  it('deve DELETE por id', () => {
    service.excluirCarona(42).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/42`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
