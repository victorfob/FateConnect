import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { CaronaCardComponent } from '../../components/carona-card/carona-card.component';
import { CaronaFilterComponent } from '../../components/carona-filter/carona-filter.component';
import { TypographyComponent } from '../../../../shared/ui/typography/typography';
import { Carona } from '../../models/carona.model';
import { FiltroCarona } from '../../models/filtro.model';
import { CaronaService } from '../../services/carona.service';

@Component({
  selector: 'app-buscar-carona',
  imports: [
    CommonModule,
    CaronaCardComponent,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CaronaFilterComponent,
    TypographyComponent,
  ],
  templateUrl: './buscar-carona.component.html',
  styleUrl: './buscar-carona.component.scss',
})
export class BuscarCaronaComponent implements OnInit {
  private readonly caronaService = inject(CaronaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  listaCaronas: Carona[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.buscarCaronas();
  }

  buscarCaronas(filtros?: FiltroCarona) {
    this.isLoading = true;
    this.caronaService
      .listarCaronas(filtros)
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (dadosApi) => {
          this.listaCaronas = dadosApi;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar caronas. Tente novamente.', 'Fechar', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error'],
          });
        },
      });
  }

  onEditar(_carona: Carona): void {
    this.snackBar.open('Edição de carona em breve.', 'OK', {
      duration: 3500,
      verticalPosition: 'top',
      panelClass: ['snackbar-warning'],
    });
  }

  onExcluir(carona: Carona) {
    this.isLoading = true;
    this.caronaService
      .excluirCarona(carona.id)
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.listaCaronas = this.listaCaronas.filter((c) => c.id !== carona.id);
          this.snackBar.open('Carona excluída com sucesso.', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success'],
          });
        },
        error: () => {
          this.snackBar.open('Erro ao excluir a carona. Tente novamente.', 'Fechar', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error'],
          });
        },
      });
  }
}
