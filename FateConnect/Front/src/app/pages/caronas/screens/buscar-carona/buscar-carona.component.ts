import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  readonly listaCaronas = signal<Carona[]>([]);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.buscarCaronas();
  }

  buscarCaronas(filtros?: FiltroCarona): void {
    this.isLoading.set(true);
    this.caronaService
      .listarCaronas(filtros)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (dadosApi) => {
          this.listaCaronas.set(dadosApi);
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

  onExcluir(carona: Carona): void {
    this.isLoading.set(true);
    this.caronaService
      .excluirCarona(carona.id)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.listaCaronas.update((lista) => lista.filter((c) => c.id !== carona.id));
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
