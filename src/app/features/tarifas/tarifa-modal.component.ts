import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Apollo } from 'apollo-angular';
import { CREAR_TARIFA, RUTAS } from '../../graphql/catalogo.graphql';

interface RutaItem { id: string; origen: { nombre: string }; destino: { nombre: string } }

@Component({
  selector: 'app-tarifa-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="overlay" (click)="close()"><div class="modal" (click)="$event.stopPropagation()">
      <div class="mh"><h3>Nueva tarifa</h3><button class="cbtn" (click)="close()"><mat-icon>close</mat-icon></button></div>
      <form [formGroup]="form" (ngSubmit)="submit()" class="mb">
        <div class="f"><label class="fl">Ruta</label><select class="inp" formControlName="rutaId"><option value="">Seleccionar</option><option *ngFor="let r of rutas()" [value]="r.id">{{r.origen.nombre}} → {{r.destino.nombre}}</option></select></div>
        <div class="f"><label class="fl">Precio base (Bs)</label><input class="inp" type="number" formControlName="precioBase" /></div>
        <div class="f"><label class="fl">Tipo de dia</label><select class="inp" formControlName="tipoDia"><option value="NORMAL">Normal</option><option value="FERIADO">Feriado</option><option value="FIN_DE_SEMANA">Fin de semana</option><option value="ESPECIAL">Especial</option></select></div>
        <div class="row2"><div class="f"><label class="fl">Vigente desde</label><input class="inp" type="date" formControlName="vigenteDesde" /></div>
        <div class="f"><label class="fl">Vigente hasta</label><input class="inp" type="date" formControlName="vigenteHasta" /></div></div>
        <div class="mf"><button type="button" class="btn btn-ghost btn-sm" (click)="close()">Cancelar</button><button type="submit" class="btn btn-primary btn-sm" [disabled]="saving()">{{saving()?'Guardando...':'Guardar tarifa'}}</button></div>
      </form>
    </div></div>
  `,
  styles: [`.overlay{position:fixed;inset:0;z-index:200;background:rgba(var(--brand-800-rgb),.35);backdrop-filter:blur(2px);display:grid;place-items:center}.modal{background:var(--color-surface);border-radius:var(--r-xl);box-shadow:var(--shadow-xl);width:480px;max-width:calc(100vw - 40px)}.mh{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid var(--color-divider)}.mh h3{margin:0;font-size:16px;font-weight:700;color:var(--ink-900)}.cbtn{border:none;background:none;cursor:pointer;color:var(--ink-500);padding:4px}.mb{padding:22px;display:flex;flex-direction:column;gap:14px}.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.f{display:flex;flex-direction:column;gap:6px}.fl{font-size:12.5px;font-weight:600;color:var(--ink-700)}.inp{width:100%;height:38px;padding:0 12px;border-radius:var(--r-md);border:1px solid var(--ink-200);background:var(--color-surface);font-size:14px;color:var(--color-text-primary);font-family:inherit}.inp:focus{outline:none;border-color:var(--brand-600);box-shadow:0 0 0 3px rgba(var(--brand-800-rgb),.12)}.mf{display:flex;justify-content:flex-end;gap:8px;padding-top:8px}.btn{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:var(--r-md);font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit}.btn-sm{height:34px;padding:0 14px;font-size:13px}.btn-primary{background:var(--color-primary);color:var(--white)}.btn-primary:hover{background:var(--color-primary-dark)}.btn-ghost{background:transparent;color:var(--ink-700)}.btn-ghost:hover{background:var(--ink-100)}.btn:disabled{opacity:.5;cursor:not-allowed}select.inp{cursor:pointer}`],
})
export class TarifaModalComponent {
  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);
  private snackBar = inject(MatSnackBar);
  private ref = inject(MatDialogRef<TarifaModalComponent>);
  readonly saving = signal(false);
  readonly rutas = signal<RutaItem[]>([]);

  readonly form = this.fb.group({
    rutaId: ['', Validators.required],
    precioBase: [0, [Validators.required, Validators.min(1)]],
    tipoDia: ['NORMAL', Validators.required],
    vigenteDesde: ['', Validators.required],
    vigenteHasta: [''],
  });

  constructor() {
    this.apollo.query<any>({ query: RUTAS, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.rutas) this.rutas.set(r.data.rutas); },
    });
  }

  close(r?: any) { this.ref.close(r); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value;
    const input: any = { rutaId: val.rutaId, precioBase: Number(val.precioBase), tipoDia: val.tipoDia, vigenteDesde: val.vigenteDesde };
    if (val.vigenteHasta) input.vigenteHasta = val.vigenteHasta;
    this.apollo.mutate<any>({ mutation: CREAR_TARIFA, variables: { input } }).subscribe({
      next: () => { this.saving.set(false); this.snackBar.open('Tarifa creada', 'Cerrar', { duration: 3000 }); this.close(true); },
      error: (e: any) => { this.saving.set(false); this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }); },
    });
  }
}
