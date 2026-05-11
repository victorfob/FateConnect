import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs/operators';
import { TypographyComponent } from '../../../../shared/ui/typography/typography';
import { Login } from './models/login.model';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-landing-login-card',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FontAwesomeModule,
    TypographyComponent,
  ],
  templateUrl: './landing-login-card.component.html',
  styleUrl: './landing-login-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingLoginCardComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild('emailInput') emailInputRef!: ElementRef<HTMLInputElement>;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly hidePassword = signal(true);
  readonly eyeIcon = faEye;
  readonly eyeSlashIcon = faEyeSlash;
  readonly isLoading = signal(false);

  ngAfterViewInit(): void {
    this.setupFocusListener();
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.disable();
    this.isLoading.set(true);

    const formValue = this.form.getRawValue();

    const payload: Login = {
      emailFatec: formValue.email,
      senha: formValue.password,
    };

    this.authService.login(payload).subscribe({
      next: (response) => this.handleSuccessfulLogin(response),
      error: (err) => this.handleFailedLogin(err),
    });
  }

  private setupFocusListener(): void {
    const focusEmail = (): void => {
      this.emailInputRef?.nativeElement.focus();
    };

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.router.parseUrl(this.router.url).fragment === 'login') {
          setTimeout(focusEmail);
        }
      });

    if (this.router.parseUrl(this.router.url).fragment === 'login') {
      setTimeout(focusEmail);
    }
  }

  private handleSuccessfulLogin(response: any): void {
    this.snackBar.open(`Bem-vindo(a), ${response.nomeCompleto}!`, 'OK', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });

    this.router.navigate(['/menu']);
  }

  private handleFailedLogin(err: any): void {
    this.form.enable();
    this.isLoading.set(false);

    let msgErro = 'Erro ao realizar login. Tente novamente.';

    if (err.status === 401) {
      msgErro = 'E-mail ou senha inválidos.';
    }

    this.snackBar.open(msgErro, 'OK', {
      duration: 5000,
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
    });
  }
}
