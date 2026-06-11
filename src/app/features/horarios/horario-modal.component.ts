import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Apollo } from 'apollo-angular';
import { CREAR_HORARIO, RUTAS } from '../../graphql/catalogo.graphql';

interface RutaItem { id: string; origen: { nombre: string }; destino: { nombre: string } }

@Component({
  selector: 'app-horario-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="overlay" (click)="close()"><div class="modal" (click)="$event.stopPropagation()">
      <div class="mh"><h3>Nuevo horario</h3><button class="cbtn" (click)="close()"><mat-icon>close</mat-icon></button></div>
      <form [formGroup]="form" (ngSubmit)="submit()" class="mb">
        <div class="f"><label class="fl">Ruta</label><select class="inp" formControlName="rutaId"><option value="">Seleccionar</option><option *ngFor="let r of rutas()" [value]="r.id">{{r.origen.nombre}} → {{r.destino.nombre}}</option></select></div>
        <div class="f"><label class="fl">Hora de salida</label><input class="inp" type="time" formControlName="horaSalida" /></div>
        <div class="f"><label class="fl">Dias</label><div class="days">@for (d of dias; track d.value) {<label class="day"><input type="checkbox" [value]="d.value" (change)="toggleDia(d.value)" />{{d.label}}</label>}</div></div>
        <div class="mf"><button type="button" class="btn btn-ghost btn-sm" (click)="close()">Cancelar</button><button type="submit" class="btn btn-primary btn-sm" [disabled]="saving()||diasSeleccionados().length===0">{{saving()?'Guardando...':'Guardar horario'}}</button></div>
      </form>
    </div></div>
  `,
  styles: [`.overlay{position:fixed;inset:0;z-index:200;background:rgba(var(--brand-800-rgb),.35);backdrop-filter:blur(2px);display:grid;place-items:center}.modal{background:var(--color-surface);border-radius:var(--r-xl);box-shadow:var(--shadow-xl);width:480px;max-width:calc(100vw - 40px)}.mh{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid var(--color-divider)}.mh h3{margin:0;font-size:16px;font-weight:700;color:var(--ink-900)}.cbtn{border:none;background:none;cursor:pointer;color:var(--ink-500);padding:4px}.mb{padding:22px;display:flex;flex-direction:column;gap:14px}.f{display:flex;flex-direction:column;gap:6px}.fl{font-size:12.5px;font-weight:600;color:var(--ink-700)}.inp{width:100%;height:38px;padding:0 12px;border-radius:var(--r-md);border:1px solid var(--ink-200);background:var(--color-surface);font-size:14px;color:var(--color-text-primary);font-family:inherit}.inp:focus{outline:none;border-color:var(--brand-600);box-shadow:0 0 0 3px rgba(var(--brand-800-rgb),.12)}.days{display:flex;flex-wrap:wrap;gap:6px}.day{display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;padding:4px 8px;border-radius:var(--r-sm);border:1px solid var(--ink-200)}.day:has(input:checked){background:var(--brand-050);border-color:var(--brand-600);color:var(--brand-700);font-weight:600}.mf{display:flex;justify-content:flex-end;gap:8px;padding-top:8px}.btn{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:var(--r-md);font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit}.btn-sm{height:34px;padding:0 14px;font-size:13px}.btn-primary{background:var(--color-primary);color:var(--white)}.btn-primary:hover{background:var(--color-primary-dark)}.btn-ghost{background:transparent;color:var(--ink-700)}.btn-ghost:hover{background:var(--ink-100)}.btn:disabled{opacity:.5;cursor:not-allowed}select.inp{cursor:pointer}`],
})
export class HorarioModalComponent {
  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);
  private snackBar = inject(MatSnackBar);
  private ref = inject(MatDialogRef<HorarioModalComponent>);
  readonly saving = signal(false);
  readonly rutas = signal<RutaItem[]>([]);
  readonly diasSeleccionados = signal<number[]>([]);

  readonly dias = [
    { value: 0, label: 'Dom' }, { value: 1, label: 'Lun' }, { value: 2, label: 'Mar' },
    { value: 3, label: 'Mie' }, { value: 4, label: 'Jue' }, { value: 5, label: 'Vie' }, { value: 6, label: 'Sab' },
  ];

  readonly form = this.fb.group({
    rutaId: ['', Validators.required],
    horaSalida: ['', Validators.required],
  });

  constructor() {
    this.apollo.query<any>({ query: RUTAS, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.rutas) this.rutas.set(r.data.rutas); },
    });
  }

  toggleDia(v: number) {
    const cur = this.diasSeleccionados();
    if (cur.includes(v)) this.diasSeleccionados.set(cur.filter((d) => d !== v));
    else this.diasSeleccionados.set([...cur, v]);
  }

  close(r?: any) { this.ref.close(r); }

  submit() {
    if (this.form.invalid || this.diasSeleccionados().length === 0) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const input = { ...this.form.value, diasSemana: this.diasSeleccionados() };
    this.apollo.mutate<any>({ mutation: CREAR_HORARIO, variables: { input } }).subscribe({
      next: () => { this.saving.set(false); this.snackBar.open('Horario creado', 'Cerrar', { duration: 3000 }); this.close(true); },
      error: (e: any) => { this.saving.set(false); this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }); },
    });
  }
}
