import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircleInfo,
  faFilter,
  faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';

import {
  faCalendarDays,
  faClock
} from '@fortawesome/free-regular-svg-icons';
import { FiltroCarona } from '../../models/filtro.model';
import type { CaronaType } from '../../models/carona-type.model';
import { TypographyComponent } from '../../../../shared/ui/typography/typography';

export type CaronaFilterForm = FormGroup<{
  data: FormControl<Date | null>;
  hora: FormControl<string | null>;
  destino: FormControl<string | null>;
  caronaType: FormControl<CaronaType | null>;
}>;

@Component({
  selector: 'app-carona-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    FontAwesomeModule,
    TypographyComponent,
  ],
  templateUrl: './carona-filter.component.html',
  styleUrls: ['./carona-filter.component.scss']
})
export class CaronaFilterComponent {
  private readonly formBuilder = inject(FormBuilder);

  @Output() filterTriggered = new EventEmitter<FiltroCarona>();

  readonly filterForm: CaronaFilterForm = this.formBuilder.group({
    data: new FormControl<Date | null>(null),
    hora: new FormControl<string | null>(null),
    destino: new FormControl<string | null>(null),
    caronaType: new FormControl<CaronaType | null>(null),
  });

  protected readonly iconeFiltro = faFilter;
  protected readonly iconeLupa = faMagnifyingGlass;
  protected readonly iconeInfo = faCircleInfo;
  protected readonly iconeRelogio = faClock;
  protected readonly iconeAgenda = faCalendarDays;

  /** Values aligned with .NET `EnumTipoCarona` for query string binding. */
  readonly caronaTypeOptions: { value: CaronaType | null; viewValue: string }[] = [
    { value: null, viewValue: 'Todas' },
    { value: 'Filantropica', viewValue: 'Filantrópica' },
    { value: 'Igualitaria', viewValue: 'Igualitária' },
  ];

  applyFilters(): void {
    const formValue = this.filterForm.getRawValue();

    const mergedFilters: FiltroCarona = {};

    if (formValue.data) {
      const dateValue = new Date(formValue.data);
      const year = dateValue.getFullYear();
      const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
      const day = dateValue.getDate().toString().padStart(2, '0');

      mergedFilters.data = `${year}-${month}-${day}`;
    }

    if (formValue.hora) {
      mergedFilters.hora = formValue.hora;
    }
    if (formValue.destino) {
      mergedFilters.destino = formValue.destino.trim();
    }
    if (formValue.caronaType) {
      mergedFilters.caronaType = formValue.caronaType;
    }

    this.filterTriggered.emit(mergedFilters);
  }
}
