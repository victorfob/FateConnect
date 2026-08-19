import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { NgxMaskDirective } from 'ngx-mask';
import { EMPTY, catchError, debounceTime, distinctUntilChanged, filter, finalize, map, switchMap } from 'rxjs';

import { CepLookupService } from '../../core/services/cep-lookup.service';
import { TypographyComponent } from '../../shared/ui/typography/typography';
import { BirthDateSlashMaskDirective } from './birth-date-slash-mask.directive';
import { BRAZILIAN_STATES } from './brazilian-states.constant';
import { GENDER_OPTIONS, type GenderValue } from './gender-options.constant';
import { UserResponse } from './models/user.model';
import { SignupService } from './services/signup.service';
import { mapSignupFormToDto } from './signup.mappert';

function brazilianPhoneValidator(control: AbstractControl): ValidationErrors | null {
  const raw = String(control.value ?? '').replaceAll(/\D/g, '');
  if (!raw.length) return null;
  if (raw.length < 10 || raw.length > 11) return { brazilianPhone: true };

  return null;
}

@Component({
  selector: 'app-signup-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    FontAwesomeModule,
    TypographyComponent,
    NgxMaskDirective,
    BirthDateSlashMaskDirective,
  ],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.scss',
})
export class SignupPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cepLookup = inject(CepLookupService);
  private readonly signupService = inject(SignupService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly hidePassword = signal(true);
  readonly cepLookupLoading = signal(false);
  readonly eyeIcon = faEye;
  readonly eyeSlashIcon = faEyeSlash;

  readonly genderOptions = GENDER_OPTIONS;
  readonly brazilianStates = BRAZILIAN_STATES;

  /** Última data de nascimento permitida: quem completa 18 anos hoje ainda pode se cadastrar. */
  readonly maxBirthDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  })();
  readonly minBirthDate = new Date(1900, 0, 1);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    nickname: [''],
    fatecEmail: ['', [Validators.required, Validators.email]],
    birthDate: [null as Date | null, Validators.required],
    gender: ['' as GenderValue | '', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    zipCode: [''],
    state: [''],
    city: [''],
    street: [''],
    streetNumber: [''],
    complement: [''],
    phone: ['', [Validators.required, brazilianPhoneValidator]],
    contactEmail: ['', [Validators.required, Validators.email]],
    acceptTerms: [false, Validators.requiredTrue],
    acceptMarketing: [false],
  });

  ngOnInit(): void {
    this.setupCepListener();
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  notifyLegalSoon(event: Event, kind: 'terms' | 'privacy'): void {
    event.preventDefault();
    event.stopPropagation();

    const message =
      kind === 'terms'
        ? 'Termos de uso estarão disponíveis em breve.'
        : 'Política de privacidade estará disponível em breve.';

    this.showSnackbar(message, 'snackbar-warning');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.disable();

    const payload = mapSignupFormToDto(this.form.getRawValue());

    this.signupService.signup(payload).subscribe({
      next: (response) => this.handleSuccessfulSignup(response),
      error: (err) => this.handleFailedSignup(err),
    });
  }


  private setupCepListener(): void {
    this.form.controls.zipCode.valueChanges
      .pipe(
        map((value) => String(value ?? '').replaceAll(/\D/g, '')),
        debounceTime(400),
        distinctUntilChanged(),
        filter((digits) => digits.length === 8),
        switchMap((digits) => this.fetchCepData(digits)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((data) => this.patchAddressData(data));
  }

  private fetchCepData(digits: string) {
    this.cepLookupLoading.set(true);

    return this.cepLookup.lookup(digits).pipe(
      catchError(() => {
        this.showSnackbar('Não foi possível consultar o CEP. Tente novamente.', 'snackbar-error');
        return EMPTY;
      }),
      finalize(() => this.cepLookupLoading.set(false))
    );
  }

  private patchAddressData(data: any): void {
    if (data.erro === 'true') {
      this.form.patchValue({ street: '', city: '', state: '' }, { emitEvent: false });
      this.showSnackbar('CEP não encontrado.', 'snackbar-warning');

      return;
    }

    this.form.patchValue(
      {
        zipCode: data.cep ?? '',
        street: data.logradouro ?? '',
        city: data.localidade ?? '',
        state: data.uf ?? '',
      },
      { emitEvent: false }
    );
  }

  private handleSuccessfulSignup(response: UserResponse): void {
    this.showSnackbar(`Conta criada com sucesso, ${response.nomeCompleto}!`, 'snackbar-success');
    this.router.navigate(['/inicio'], { fragment: 'login' });
  }

  private handleFailedSignup(error: any): void {
    this.form.enable();

    let msgErro = 'Erro ao realizar cadastro. Tente novamente.';

    if (error.status === 409) msgErro = 'Este e-mail já está em uso.';
    if (error.status === 400) msgErro = 'Dados inválidos. Verifique os campos preenchidos.';

    this.showSnackbar(msgErro, 'snackbar-error');
  }

  private showSnackbar(message: string, panelClass: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }
}
