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
import { RideCardComponent } from '../../components/ride-card/ride-card.component';
import { RideFilterComponent } from '../../components/ride-filter/ride-filter.component';
import { TypographyComponent } from '../../../../shared/ui/typography/typography';
import { Ride } from '../../models/ride.model';
import { RideFilter } from '../../models/ride-filter.model';
import { RideService } from '../../services/ride.service';

@Component({
  selector: 'app-search-ride',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RideCardComponent,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RideFilterComponent,
    TypographyComponent,
  ],
  templateUrl: './search-ride.component.html',
  styleUrl: './search-ride.component.scss',
})
export class SearchRideComponent implements OnInit {
  private readonly rideService = inject(RideService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly rideList = signal<Ride[]>([]);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.loadRides();
  }

  loadRides(filters?: RideFilter): void {
    this.isLoading.set(true);
    this.rideService
      .listRides(filters)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => {
          this.rideList.set(data);
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

  onEdit(_ride: Ride): void {
    this.snackBar.open('Edição de carona em breve.', 'OK', {
      duration: 3500,
      verticalPosition: 'top',
      panelClass: ['snackbar-warning'],
    });
  }

  onDelete(ride: Ride): void {
    this.isLoading.set(true);
    this.rideService
      .deleteRide(ride.id)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.rideList.update((list) => list.filter((r) => r.id !== ride.id));
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
