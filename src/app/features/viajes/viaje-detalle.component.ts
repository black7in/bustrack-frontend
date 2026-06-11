import { Component, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StatusBadgeComponent, BadgeVariant } from '../../shared/components/status-badge/status-badge.component';
import { VIAJE_DETALLE, BOLETOS_POR_VIAJE, INICIAR_VIAJE, FINALIZAR_VIAJE, CANCELAR_VIAJE, CANCELAR_BOLETO } from '../../graphql/viajes.graphql';

const ESTADO_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  PROGRAMADO: { label: 'Programado', variant: 'neutral' },
  EN_RUTA: { label: 'En ruta', variant: 'info' },
  COMPLETADO: { label: 'Completado', variant: 'ok' },
  CANCELADO: { label: 'Cancelado', variant: 'err' },
};

@Component({
  selector: 'app-viaje-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatSnackBarModule, MatDialogModule, StatusBadgeComponent],
  templateUrl: './viaje-detalle.component.html',
  styleUrl: './viaje-detalle.component.scss',
})
export class ViajeDetalleComponent {
  private route = inject(ActivatedRoute);
  private apollo = inject(Apollo);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  readonly viaje = signal<any>(null);
  readonly boletos = signal<any[]>([]);

  constructor() {
    this.route.params.subscribe((p) => {
      this.load(p['id']);
      this.loadBoletos(p['id']);
    });
  }

  private load(id: string): void {
    this.apollo.query<any>({ query: VIAJE_DETALLE, variables: { id }, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.viaje) this.viaje.set(r.data.viaje); },
    });
  }

  private loadBoletos(id: string): void {
    this.apollo.query<any>({ query: BOLETOS_POR_VIAJE, variables: { viajeId: id }, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.boletos?.items) this.boletos.set(r.data.boletos.items); },
    });
  }

  getEstadoInfo(e: string) { return ESTADO_MAP[e] ?? { label: e, variant: 'neutral' as BadgeVariant }; }

  iniciar() {
    const id = this.viaje()?.id;
    this.apollo.mutate<any>({ mutation: INICIAR_VIAJE, variables: { id } }).subscribe({
      next: () => { this.load(id); this.snackBar.open('Viaje iniciado', 'Cerrar', { duration: 3000 }); },
      error: (e: any) => this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }),
    });
  }

  finalizar() {
    const id = this.viaje()?.id;
    this.apollo.mutate<any>({ mutation: FINALIZAR_VIAJE, variables: { id } }).subscribe({
      next: () => { this.load(id); this.snackBar.open('Viaje finalizado', 'Cerrar', { duration: 3000 }); },
      error: (e: any) => this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }),
    });
  }

  cancelar() {
    const id = this.viaje()?.id;
    this.apollo.mutate<any>({ mutation: CANCELAR_VIAJE, variables: { id } }).subscribe({
      next: () => { this.load(id); this.snackBar.open('Viaje cancelado', 'Cerrar', { duration: 3000 }); },
      error: (e: any) => this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }),
    });
  }

  cancelarBoleto(boletoId: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Cancelar boleto', message: 'Confirmar devolucion del boleto? El monto sera calculado por el sistema.', confirmColor: 'warn', confirmLabel: 'Cancelar boleto' },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.apollo.mutate<any>({ mutation: CANCELAR_BOLETO, variables: { id: boletoId } }).subscribe({
          next: (r) => {
            const monto = r.data?.cancelarBoleto?.montoDevuelto;
            this.snackBar.open('Boleto cancelado. Devolucion: Bs ' + (monto ?? '---'), 'Cerrar', { duration: 4000 });
            this.loadBoletos(this.viaje()?.id);
          },
          error: (e: any) => this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }
}
