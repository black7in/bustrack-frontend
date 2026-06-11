import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService, Usuario } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly hidePassword = signal(true);
  readonly errorMessage = signal('');

  readonly stats = [
    { value: '12,400+', label: 'Boletos / mes' },
    { value: '42', label: 'Rutas activas' },
    { value: '99.7%', label: 'Uptime' },
  ];

  readonly topoPaths = Array.from({ length: 24 }, (_, i) => {
    const off = i * 16;
    const d = `M0 ${300 + off + Math.sin(i) * 40} Q150 ${200 + off + Math.cos(i * 1.3) * 60} 300 ${280 + off + Math.sin(i * 0.7) * 50} T 600 ${260 + off}`;
    return { d, key: i };
  });

  form: FormGroup = this.fb.group({
    email: ['admin@bustrack.com', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  constructor() {
    if (this.auth.getToken()) {
      this.router.navigate(['/app/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.value;

    this.auth.login(email, password).subscribe({
      next: (result: any) => {
        this.loading.set(false);
        const data = result.data?.login;
        if (data) {
          this.auth.handleLoginSuccess(data.token, data.usuario);
        }
      },
      error: (err: any) => {
        this.loading.set(false);
        const msg = err?.graphQLErrors?.[0]?.message || err?.message || 'Error de conexion';
        this.errorMessage.set(msg);
        this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'snack-error' });
      },
    });
  }

  togglePassword(): void {
    this.hidePassword.update((v) => !v);
  }

  get emailControl() {
    return this.form.get('email');
  }

  get passwordControl() {
    return this.form.get('password');
  }
}
