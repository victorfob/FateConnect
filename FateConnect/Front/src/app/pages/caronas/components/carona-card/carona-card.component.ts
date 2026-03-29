import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCalendar,
  faClock,
  faPenToSquare,
  faTrash,
  faUserGroup
} from '@fortawesome/free-solid-svg-icons';
import { Carona } from '../../models/carona.model';
import { ConfirmDialogComponent } from '../../../../shared/ui/dialogs/confirm-dialog/confirm-dialog.component';
import { TypographyComponent } from '../../../../shared/ui/typography/typography';

@Component({
  selector: 'app-carona-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FontAwesomeModule,
    TypographyComponent,
  ],
  templateUrl: './carona-card.component.html',
  styleUrl: './carona-card.component.scss'
})
export class CaronaCardComponent {
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  @Input({ required: true }) carona!: Carona;
  @Output() editar = new EventEmitter<Carona>();
  @Output() excluir = new EventEmitter<Carona>();

  protected readonly iconeCalendario = faCalendar;
  protected readonly iconeRelogio = faClock;
  protected readonly iconeUserGroup = faUserGroup;
  protected readonly iconeEditar = faPenToSquare;
  protected readonly iconeDeletar = faTrash;

  getCorTipoCarona(tipo: string): string {
    return `tag ${tipo == "Filantropica" ? "verde" : "marrom"}`;
  }

  getTextoTipoCaronaCorrigido(tipo: string): string {
    return tipo == "Filantropica" ? "Filantrópica" : "Igualitária";
  }

  onEditar(): void {
    this.editar.emit(this.carona);
  }

  confirmarExclusao(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Exclusão',
        messagePrefix: 'Tem certeza que deseja excluir a carona para ',
        messageEmphasis: this.carona.destino,
        messageSuffix: '?',
        cancelText: 'Cancelar',
        confirmText: 'Excluir',
      }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmado) => {
        if (confirmado) {
          this.excluir.emit(this.carona);
        }
      });
  }
}
