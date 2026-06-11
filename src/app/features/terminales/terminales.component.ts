import { Component, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TERMINALES, CREAR_TERMINAL, ACTUALIZAR_TERMINAL } from '../../graphql/catalogo.graphql';

interface Terminal { id: string; nombre: string; ciudad?: string }

@Component({
  selector: 'app-terminales',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './terminales.component.html',
  styleUrl: './terminales.component.scss',
})
export class TerminalesComponent {
  private apollo = inject(Apollo);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  readonly terminales = signal<Terminal[]>([]);
  readonly editing = signal<Terminal | null>(null);
  readonly showForm = signal(false);

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    ciudad: ['', Validators.required],
  });

  constructor() { this.load(); }

  load(): void {
    this.apollo.query<any>({ query: TERMINALES, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.terminales) this.terminales.set(r.data.terminales); },
    });
  }

  newTerminal(): void {
    this.editing.set(null);
    this.form.reset({ nombre: '', ciudad: '' });
    this.showForm.set(true);
  }

  editTerminal(t: Terminal): void {
    this.editing.set(t);
    this.form.patchValue({ nombre: t.nombre, ciudad: t.ciudad || '' });
    this.showForm.set(true);
  }

  cancel(): void { this.showForm.set(false); this.editing.set(null); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const edit = this.editing();
    const mutation = edit ? ACTUALIZAR_TERMINAL : CREAR_TERMINAL;
    const variables = edit ? { id: edit.id, input: this.form.value } : { input: this.form.value };
    this.apollo.mutate<any>({ mutation, variables }).subscribe({
      next: () => { this.showForm.set(false); this.editing.set(null); this.load(); this.snackBar.open(edit ? 'Terminal actualizada' : 'Terminal creada', 'Cerrar', { duration: 3000 }); },
      error: (e: any) => this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }),
    });
  }
}
