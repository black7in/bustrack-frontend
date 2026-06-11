import { Component, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RUTA_POR_ID, HORARIOS_POR_RUTA, TARIFAS_POR_RUTA, CREAR_HORARIO, CREAR_TARIFA, ACTUALIZAR_TARIFA } from '../../graphql/catalogo.graphql';

@Component({
  selector: 'app-ruta-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './ruta-detalle.component.html',
  styleUrl: './ruta-detalle.component.scss',
})
export class RutaDetalleComponent {
  private route = inject(ActivatedRoute);
  private apollo = inject(Apollo);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  readonly ruta = signal<any>(null);
  readonly horarios = signal<any[]>([]);
  readonly tarifas = signal<any[]>([]);
  readonly tab = signal<'horarios' | 'tarifas'>('horarios');
  readonly showHorarioForm = signal(false);
  readonly showTarifaForm = signal(false);
  readonly editingTarifa = signal<any>(null);
  readonly saving = signal(false);

  readonly diasOptions = [
    { value: 0, label: 'Dom' }, { value: 1, label: 'Lun' }, { value: 2, label: 'Mar' },
    { value: 3, label: 'Mie' }, { value: 4, label: 'Jue' }, { value: 5, label: 'Vie' }, { value: 6, label: 'Sab' },
  ];

  readonly horarioForm = this.fb.group({
    horaSalida: ['', Validators.required],
    diasSemana: [[] as number[], Validators.required],
  });

  readonly tarifaForm = this.fb.group({
    tipoDia: ['LUNES_JUEVES', Validators.required],
    precioBase: [0, [Validators.required, Validators.min(1)]],
    vigenteDesde: ['', Validators.required],
  });

  readonly rutaId = signal('');

  constructor() {
    this.route.params.subscribe((p) => {
      this.rutaId.set(p['id']);
      this.loadRuta();
      this.loadHorarios();
      this.loadTarifas();
    });
  }

  private loadRuta(): void {
    this.apollo.query<any>({ query: RUTA_POR_ID, variables: { id: this.rutaId() }, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { this.ruta.set(r.data?.ruta); },
    });
  }

  private loadHorarios(): void {
    this.apollo.query<any>({ query: HORARIOS_POR_RUTA, variables: { rutaId: this.rutaId() }, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.horarios) this.horarios.set(r.data.horarios); },
    });
  }

  private loadTarifas(): void {
    this.apollo.query<any>({ query: TARIFAS_POR_RUTA, variables: { rutaId: this.rutaId() }, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.tarifas) this.tarifas.set(r.data.tarifas); },
    });
  }

  toggleDia(v: number): void {
    const cur = this.horarioForm.value.diasSemana as number[];
    if (cur.includes(v)) this.horarioForm.patchValue({ diasSemana: cur.filter((d) => d !== v) });
    else this.horarioForm.patchValue({ diasSemana: [...cur, v] });
  }

  saveHorario(): void {
    if (this.horarioForm.invalid || (this.horarioForm.value.diasSemana as number[]).length === 0) { this.horarioForm.markAllAsTouched(); return; }
    this.saving.set(true);
    this.apollo.mutate<any>({
      mutation: CREAR_HORARIO,
      variables: { input: { ...this.horarioForm.value, rutaId: this.rutaId() } },
    }).subscribe({
      next: () => { this.saving.set(false); this.showHorarioForm.set(false); this.loadHorarios(); this.snackBar.open('Horario creado', 'Cerrar', { duration: 3000 }); },
      error: (e: any) => { this.saving.set(false); this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }); },
    });
  }

  saveTarifa(): void {
    if (this.tarifaForm.invalid) { this.tarifaForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.tarifaForm.value;
    const input: any = { rutaId: this.rutaId(), tipoDia: val.tipoDia, precioBase: Number(val.precioBase), vigenteDesde: val.vigenteDesde };
    const edit = this.editingTarifa();
    const mutation = edit ? ACTUALIZAR_TARIFA : CREAR_TARIFA;
    const variables = edit ? { id: edit.id, input } : { input };
    this.apollo.mutate<any>({ mutation, variables }).subscribe({
      next: () => { this.saving.set(false); this.showTarifaForm.set(false); this.editingTarifa.set(null); this.loadTarifas(); this.snackBar.open(edit ? 'Tarifa actualizada' : 'Tarifa creada', 'Cerrar', { duration: 3000 }); },
      error: (e: any) => { this.saving.set(false); this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }); },
    });
  }

  editTarifa(t: any): void {
    this.editingTarifa.set(t);
    this.tarifaForm.patchValue({ tipoDia: t.tipoDia, precioBase: t.precioBase, vigenteDesde: t.vigenteDesde || '' });
    this.showTarifaForm.set(true);
  }

  cancelTarifaForm(): void {
    this.showTarifaForm.set(false);
    this.editingTarifa.set(null);
    this.tarifaForm.reset({ tipoDia: 'LUNES_JUEVES', precioBase: 0, vigenteDesde: '' });
  }

  diasLabel(dias: number[]): string {
    if (!dias?.length) return '---';
    const map = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    return dias.map((d) => map[d]).join(', ');
  }
}
