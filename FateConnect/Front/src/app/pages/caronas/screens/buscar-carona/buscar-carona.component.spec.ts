import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { BuscarCaronaComponent } from './buscar-carona.component';
import { CaronaService } from '../../services/carona.service';
import { Carona } from '../../models/carona.model';

describe('BuscarCaronaComponent', () => {
  let fixture: ComponentFixture<BuscarCaronaComponent>;
  let caronaService: jasmine.SpyObj<CaronaService>;

  const caronaMock: Carona = {
    id: 1,
    qtdVagas: 2,
    destino: 'Fatec',
    dataPartida: '2025-01-01',
    horaPartida: '08:00:00',
    dataCadastro: '2025-01-01T00:00:00',
    tipoCarona: 'Filantropica',
    descricao: 'Teste',
    ativo: true,
  };

  beforeEach(async () => {
    caronaService = jasmine.createSpyObj('CaronaService', ['listarCaronas', 'excluirCarona']);
    caronaService.listarCaronas.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BuscarCaronaComponent],
      providers: [MatSnackBar, { provide: CaronaService, useValue: caronaService }],
    }).compileComponents();

    fixture = TestBed.createComponent(BuscarCaronaComponent);
    fixture.detectChanges();
  });

  it('deve chamar listarCaronas ao iniciar', () => {
    expect(caronaService.listarCaronas).toHaveBeenCalledWith(undefined);
    expect(fixture.componentInstance.listaCaronas()).toEqual([]);
  });

  it('deve atualizar lista quando a API retorna dados', async () => {
    caronaService.listarCaronas.and.returnValue(of([caronaMock]));
    const f = TestBed.createComponent(BuscarCaronaComponent);
    f.detectChanges();
    await f.whenStable();
    expect(f.componentInstance.listaCaronas()).toEqual([caronaMock]);
  });
});
