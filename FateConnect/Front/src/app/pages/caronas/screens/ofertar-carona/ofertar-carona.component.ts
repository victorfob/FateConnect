import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { TypographyComponent } from '../../../../shared/ui/typography/typography';

@Component({
  selector: 'app-ofertar-carona',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, MatSnackBarModule, TypographyComponent],
  templateUrl: './ofertar-carona.component.html',
  styleUrl: './ofertar-carona.component.scss'
})
export class OfertarCaronaComponent {
  private readonly snackBar = inject(MatSnackBar);

  iconeAdicionar = faPlus;

  onClickOfertar(): void {
    this.snackBar.open('Cadastro de nova carona em breve.', 'OK', {
      duration: 3500,
      verticalPosition: 'top',
      panelClass: ['snackbar-warning'],
    });
  }
}
