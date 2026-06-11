import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Apollo } from 'apollo-angular';
import { CREAR_VIAJE, ACTUALIZAR_VIAJE } from '../../graphql/viajes.graphql';
import { RUTAS, HORARIOS_POR_RUTA } from '../../graphql/catalogo.graphql';
import { BUSES, CHOFERES } from '../../graphql/flota.graphql';

@Component({
  selector: 'app-viaje-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="overlay" (click)="close()"><div class="modal" (click)="$event.stopPropagation()">
      <div class="mh"><h3>{{ isEdit() ? 'Editar' : 'Programar' }} viaje</h3><button class="cbtn" (click)="close()"><mat-icon>close</mat-icon></button></div>
      <form [formGroup]="form" (ngSubmit)="submit()" class="mb">
        <div class="f"><label class="fl">Ruta</label><select class="inp" formControlName="rutaId" (change)="onRutaChange($any($event.target).value)"><option value="">Seleccionar</option><option *ngFor="let r of rutas()" [value]="r.id">{{r.origen.nombre}} → {{r.destino.nombre}}</option></select></div>
        <div class="f"><label class="fl">Horario</label><select class="inp" formControlName="horarioId"><option value="">Seleccionar</option><option *ngFor="let h of horarios()" [value]="h.id">{{h.horaSalida}}</option></select></div>
        <div class="f"><label class="fl">Fecha</label><input class="inp" type="date" formControlName="fecha" /></div>
        <div class="f"><label class="fl">Bus</label><select class="inp" formControlName="busId"><option value="">Seleccionar</option><option *ngFor="let b of buses()" [value]="b.id">{{b.placa}} ({{b.capacidad}} asientos)</option></select></div>
        <div class="row2"><div class="f"><label class="fl">Chofer titular</label><select class="inp" formControlName="choferTitularId"><option value="">Seleccionar</option><option *ngFor="let c of choferes()" [value]="c.id">{{c.nombre}}</option></select></div>
        <div class="f"><label class="fl">Chofer auxiliar</label><select class="inp" formControlName="choferAuxiliarId"><option value="">Ninguno</option><option *ngFor="let c of choferes()" [value]="c.id">{{c.nombre}}</option></select></div></div>
        <div class="f"><label class="fl">Carril</label><input class="inp" formControlName="carrilAsignado" placeholder="A, B, C..." /></div>
        <div class="mf"><button type="button" class="btn btn-ghost btn-sm" (click)="close()">Cancelar</button><button type="submit" class="btn btn-primary btn-sm" [disabled]="saving()">{{saving()?'Programando...':'Programar viaje'}}</button></div>
      </form>
    </div></div>
  `,
  styles: [`.overlay{position:fixed;inset:0;z-index:200;background:rgba(var(--brand-800-rgb),.35);backdrop-filter:blur(2px);display:grid;place-items:center}.modal{background:var(--color-surface);border-radius:var(--r-xl);box-shadow:var(--shadow-xl);width:500px;max-width:calc(100vw - 40px)}.mh{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid var(--color-divider)}.mh h3{margin:0;font-size:16px;font-weight:700;color:var(--ink-900)}.cbtn{border:none;background:none;cursor:pointer;color:var(--ink-500);padding:4px}.mb{padding:22px;display:flex;flex-direction:column;gap:14px;max-height:400px;overflow:auto}.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.f{display:flex;flex-direction:column;gap:6px}.fl{font-size:12.5px;font-weight:600;color:var(--ink-700)}.inp{width:100%;height:38px;padding:0 12px;border-radius:var(--r-md);border:1px solid var(--ink-200);background:var(--color-surface);font-size:14px;color:var(--color-text-primary);font-family:inherit}.inp:focus{outline:none;border-color:var(--brand-600)}.mf{display:flex;justify-content:flex-end;gap:8px;padding-top:8px}.btn{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:var(--r-md);font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit}.btn-sm{height:34px;padding:0 14px;font-size:13px}.btn-primary{background:var(--color-primary);color:var(--white)}.btn-ghost{background:transparent;color:var(--ink-700)}.btn-ghost:hover{background:var(--ink-100)}.btn:disabled{opacity:.5}select.inp{cursor:pointer}`],
})
export class ViajeModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);
  private snackBar = inject(MatSnackBar);
  private ref = inject(MatDialogRef<ViajeModalComponent>);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as any;
  readonly isEdit = signal(!!this.data);
  readonly saving = signal(false);
  readonly rutas = signal<any[]>([]);
  readonly horarios = signal<any[]>([]);
  readonly buses = signal<any[]>([]);
  readonly choferes = signal<any[]>([]);

  readonly form = this.fb.group({
    rutaId: ['', Validators.required],
    horarioId: ['', Validators.required],
    fecha: ['', Validators.required],
    busId: ['', Validators.required],
    choferTitularId: ['', Validators.required],
    choferAuxiliarId: [''],
    carrilAsignado: [''],
  });

  ngOnInit() {
    this.apollo.query<any>({ query: RUTAS, fetchPolicy: 'network-only' }).subscribe({ next: (r) => { if (r.data?.rutas) this.rutas.set(r.data.rutas); } });
    this.apollo.query<any>({ query: BUSES, fetchPolicy: 'network-only' }).subscribe({ next: (r) => { if (r.data?.buses) this.buses.set(r.data.buses); } });
    this.apollo.query<any>({ query: CHOFERES, fetchPolicy: 'network-only' }).subscribe({ next: (r) => { if (r.data?.choferes) this.choferes.set(r.data.choferes); } });
    if (this.data) {
      this.form.patchValue({
        rutaId: this.data.horario?.ruta?.id || '',
        horarioId: this.data.horario?.id || '',
        fecha: this.data.fecha || '',
        busId: this.data.bus?.id || '',
        choferTitularId: this.data.choferTitular?.id || '',
        choferAuxiliarId: this.data.choferAuxiliar?.id || '',
        carrilAsignado: this.data.carrilAsignado || '',
      });
      if (this.data.horario?.ruta?.id) this.onRutaChange(this.data.horario.ruta.id);
    }
  }

  onRutaChange(rutaId: string) {
    this.form.patchValue({ horarioId: '' });
    if (!rutaId) { this.horarios.set([]); return; }
    this.apollo.query<any>({ query: HORARIOS_POR_RUTA, variables: { rutaId }, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.horarios) this.horarios.set(r.data.horarios); },
    });
  }

  close(r?: any) { this.ref.close(r); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.form.value;
    let input: any;
    if (this.isEdit()) {
      input = {};
      if (v.busId) input.busId = v.busId;
      if (v.choferTitularId) input.choferTitularId = v.choferTitularId;
      if (v.choferAuxiliarId) input.choferAuxiliarId = v.choferAuxiliarId;
      if (v.carrilAsignado) input.carrilAsignado = v.carrilAsignado;
    } else {
      input = { fecha: v.fecha, horarioId: v.horarioId };
      if (v.busId) input.busId = v.busId;
      if (v.choferTitularId) input.choferTitularId = v.choferTitularId;
      if (v.choferAuxiliarId) input.choferAuxiliarId = v.choferAuxiliarId;
      if (v.carrilAsignado) input.carrilAsignado = v.carrilAsignado;
    }

    const mutation = this.isEdit() ? ACTUALIZAR_VIAJE : CREAR_VIAJE;
    const variables: any = this.isEdit() ? { id: this.data.id, input } : { input };
    this.apollo.mutate<any>({ mutation, variables }).subscribe({
      next: () => { this.saving.set(false); this.snackBar.open(this.isEdit() ? 'Viaje actualizado' : 'Viaje programado', 'Cerrar', { duration: 3000 }); this.close(true); },
      error: (e: any) => { this.saving.set(false); this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }); },
    });
  }
}
