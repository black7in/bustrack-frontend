import { Component, inject, signal, computed } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StatusBadgeComponent, BadgeVariant } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../core/auth/auth.service';
import { VIAJES, CANCELAR_VIAJE, GENERAR_VIAJES_DEL_DIA } from '../../graphql/viajes.graphql';
import { RUTAS } from '../../graphql/catalogo.graphql';

interface ViajeItem { id: string; fecha: string; estado: string; carrilAsignado?: string; horario: { horaSalida: string; ruta: { id: string; origen: { nombre: string }; destino: { nombre: string } } }; bus?: { id: string; placa: string; capacidad: number } | null; choferTitular?: { id: string; nombre: string } | null; totalVendidos: number; totalLibres: number }

const ESTADO_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  PROGRAMADO: { label: 'Programado', variant: 'neutral' },
  EN_RUTA: { label: 'En ruta', variant: 'info' },
  COMPLETADO: { label: 'Completado', variant: 'ok' },
  CANCELADO: { label: 'Cancelado', variant: 'err' },
};

@Component({
  selector: 'app-viajes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatButtonModule, MatDialogModule, MatSnackBarModule, StatusBadgeComponent],
  templateUrl: './viajes.component.html',
  styleUrl: './viajes.component.scss',
})
export class ViajesComponent {
  private apollo = inject(Apollo);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private auth = inject(AuthService);
  readonly viajes = signal<ViajeItem[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly filterFecha = signal('');
  readonly filterRutaId = signal('');
  readonly filterEstado = signal('');
  readonly rutas = signal<any[]>([]);
  readonly showGenerarBtn = computed(() => {
    const rol = this.auth.usuario()?.rol;
    return rol === 'ADMIN' || rol === 'SUPERVISOR';
  });
  readonly generarFecha = signal(new Date().toISOString().split('T')[0]);

  constructor() {
    this.loadRutas();
    this.loadViajes();
  }

  private loadRutas(): void {
    this.apollo.query<any>({ query: RUTAS, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.rutas) this.rutas.set(r.data.rutas); },
    });
  }

  loadViajes(): void {
    this.loading.set(true);
    const vars: any = { page: 1, limit: 20 };
    if (this.filterFecha()) vars.fecha = this.filterFecha();
    if (this.filterRutaId()) vars.rutaId = this.filterRutaId();
    if (this.filterEstado()) vars.estado = this.filterEstado();
    this.apollo.query<any>({ query: VIAJES, variables: vars, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { this.loading.set(false); if (r.data?.viajes?.items) { this.viajes.set(r.data.viajes.items); this.total.set(r.data.viajes.total); } },
      error: () => this.loading.set(false),
    });
  }

  getEstadoInfo(e: string) { return ESTADO_MAP[e] ?? { label: e, variant: 'neutral' as BadgeVariant }; }

  abrirModal(): void {
    import('./viaje-modal.component').then((m) => {
      this.dialog.open(m.ViajeModalComponent, { width: '500px' }).afterClosed().subscribe((r) => { if (r) this.loadViajes(); });
    });
  }

  editar(v: ViajeItem): void {
    import('./viaje-modal.component').then((m) => {
      this.dialog.open(m.ViajeModalComponent, { width: '500px', data: v }).afterClosed().subscribe((r) => { if (r) this.loadViajes(); });
    });
  }

  cancelar(id: string): void {
    this.apollo.mutate<any>({ mutation: CANCELAR_VIAJE, variables: { id } }).subscribe({
      next: () => { this.snackBar.open('Viaje cancelado', 'Cerrar', { duration: 3000 }); this.loadViajes(); },
      error: (e: any) => this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }),
    });
  }

  generarViajesHoy(): void {
    const fecha = this.generarFecha();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Generar viajes del dia', message: 'Generar todos los viajes para ' + fecha + '?' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apollo.mutate<any>({ mutation: GENERAR_VIAJES_DEL_DIA, variables: { fecha } }).subscribe({
          next: (r) => {
            const viajes = r.data?.generarViajesDelDia;
            if (viajes?.length) {
              this.snackBar.open('Se generaron ' + viajes.length + ' viajes para ' + fecha, 'Cerrar', { duration: 3000, panelClass: 'snack-ok' });
            } else {
              this.snackBar.open('No hay horarios para ' + fecha + ' o los viajes ya fueron generados', 'Cerrar', { duration: 4000 });
            }
            this.loadViajes();
          },
          error: (e: any) => this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }
}
