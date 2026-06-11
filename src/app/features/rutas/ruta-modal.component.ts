import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Apollo } from 'apollo-angular';
import { CREAR_RUTA, ACTUALIZAR_RUTA, TERMINALES } from '../../graphql/catalogo.graphql';

interface TerminalItem { id: string; nombre: string; ciudad: string }

@Component({
  selector: 'app-ruta-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './ruta-modal.component.html',
  styleUrl: './ruta-modal.component.scss',
})
export class RutaModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);
  private snackBar = inject(MatSnackBar);
  private ref = inject(MatDialogRef<RutaModalComponent>);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as any;
  readonly saving = signal(false);
  readonly terminales = signal<TerminalItem[]>([]);
  readonly isEdit = signal(!!this.data);

  readonly form = this.fb.group({
    terminalOrigenId: ['', Validators.required],
    terminalDestinoId: ['', Validators.required],
    distanciaKm: [null as number | null],
    duracionEstimadaMin: [null as number | null],
  });

  ngOnInit() {
    this.apollo.query<any>({ query: TERMINALES, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.terminales) this.terminales.set(r.data.terminales); },
    });
    if (this.data) {
      this.form.patchValue({
        terminalOrigenId: this.data.origen?.id,
        terminalDestinoId: this.data.destino?.id,
        distanciaKm: this.data.distanciaKm,
        duracionEstimadaMin: this.data.duracionEstimadaMin,
      });
    }
  }

  close(r?: any) { this.ref.close(r); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const mutation = this.isEdit() ? ACTUALIZAR_RUTA : CREAR_RUTA;
    const variables = this.isEdit()
      ? { id: this.data.id, input: this.form.value }
      : { input: this.form.value };
    this.apollo.mutate<any>({ mutation, variables }).subscribe({
      next: () => { this.saving.set(false); this.snackBar.open(this.isEdit() ? 'Ruta actualizada' : 'Ruta creada', 'Cerrar', { duration: 3000 }); this.close(true); },
      error: (e: any) => { this.saving.set(false); this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }); },
    });
  }
}
