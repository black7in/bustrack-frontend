import { Component, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RUTAS, TARIFAS_POR_RUTA as TARIFAS, CREAR_TARIFA, ACTUALIZAR_TARIFA } from '../../graphql/catalogo.graphql';

interface RutaItem { id: string; origen: { nombre: string }; destino: { nombre: string } }
interface TarifaItem { id: string; precioBase: number; tipoDia: string; vigenteDesde?: string; vigenteHasta?: string }

@Component({
  selector: 'app-tarifas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './tarifas.component.html',
  styleUrl: './tarifas.component.scss',
})
export class TarifasComponent {
  private apollo = inject(Apollo);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  readonly rutas = signal<RutaItem[]>([]);
  readonly tarifas = signal<TarifaItem[]>([]);
  readonly rutaId = signal('');
  readonly editingTarifa = signal<TarifaItem | null>(null);
  readonly showForm = signal(false);
  readonly saving = signal(false);

  readonly form = this.fb.group({
    tipoDia: ['LUNES_JUEVES', Validators.required],
    precioBase: [0, [Validators.required, Validators.min(1)]],
    vigenteDesde: ['', Validators.required],
  });

  constructor() {
    this.apollo.query<any>({ query: RUTAS, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.rutas) this.rutas.set(r.data.rutas); },
    });
  }

  onRutaChange(id: string): void {
    this.rutaId.set(id);
    if (!id) { this.tarifas.set([]); return; }
    this.loadTarifas();
  }

  loadTarifas(): void {
    this.apollo.query<any>({ query: TARIFAS, variables: { rutaId: this.rutaId() }, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.tarifas) this.tarifas.set(r.data.tarifas); },
    });
  }

  newTarifa(): void {
    this.editingTarifa.set(null);
    this.form.reset({ tipoDia: 'LUNES_JUEVES', precioBase: 0, vigenteDesde: '' });
    this.showForm.set(true);
  }

  editTarifa(t: TarifaItem): void {
    this.editingTarifa.set(t);
    this.form.patchValue({ tipoDia: t.tipoDia, precioBase: t.precioBase, vigenteDesde: t.vigenteDesde || '' });
    this.showForm.set(true);
  }

  cancelForm(): void { this.showForm.set(false); this.editingTarifa.set(null); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value;
    const edit = this.editingTarifa();
    const mutation = edit ? ACTUALIZAR_TARIFA : CREAR_TARIFA;
    const input: any = { rutaId: this.rutaId(), tipoDia: val.tipoDia, precioBase: Number(val.precioBase), vigenteDesde: val.vigenteDesde };
    const variables = edit ? { id: edit.id, input } : { input };
    this.apollo.mutate<any>({ mutation, variables }).subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.editingTarifa.set(null); this.loadTarifas(); this.snackBar.open(edit ? 'Tarifa actualizada' : 'Tarifa creada', 'Cerrar', { duration: 3000 }); },
      error: (e: any) => { this.saving.set(false); this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }); },
    });
  }
}
