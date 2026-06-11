import { Component, inject, signal, computed } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StatusBadgeComponent, BadgeVariant } from '../../shared/components/status-badge/status-badge.component';
import { BUSES } from '../../graphql/flota.graphql';

interface BusItem { id: string; placa: string; marca: string; modelo: string; anio: number; numeroCarriles: number; estadoMecanico: string; fotoUrl?: string }

const ESTADO_BUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  OPERATIVO: { label: 'Operativo', variant: 'ok' },
  EN_MANTENIMIENTO: { label: 'Mantenimiento', variant: 'err' },
  FUERA_DE_SERVICIO: { label: 'Fuera de servicio', variant: 'neutral' },
  MANTENIMIENTO: { label: 'Mantenimiento', variant: 'err' },
  GARAJE: { label: 'En garaje', variant: 'neutral' },
};

@Component({
  selector: 'app-flota',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatDialogModule, StatusBadgeComponent],
  templateUrl: './flota.component.html',
  styleUrl: './flota.component.scss',
})
export class FlotaComponent {
  private apollo = inject(Apollo);
  private dialog = inject(MatDialog);
  readonly buses = signal<BusItem[]>([]);
  readonly filter = signal('');

  readonly filtered = computed(() => {
    if (!this.filter()) return this.buses();
    return this.buses().filter((b) => {
      const estado = b.estadoMecanico?.toUpperCase();
      if (this.filter() === 'operativo') return estado === 'OPERATIVO';
      if (this.filter() === 'mantenimiento') return estado === 'EN_MANTENIMIENTO' || estado === 'MANTENIMIENTO';
      if (this.filter() === 'garaje') return estado === 'FUERA_DE_SERVICIO' || estado === 'GARAJE';
      return true;
    });
  });

  readonly stats = computed(() => ({
    total: this.buses().length,
    operativo: this.buses().filter((b) => b.estadoMecanico?.toUpperCase() === 'OPERATIVO').length,
    mantenimiento: this.buses().filter((b) => ['EN_MANTENIMIENTO', 'MANTENIMIENTO'].includes(b.estadoMecanico?.toUpperCase() || '')).length,
    garaje: this.buses().filter((b) => ['FUERA_DE_SERVICIO', 'GARAJE'].includes(b.estadoMecanico?.toUpperCase() || '')).length,
  }));

  constructor() { this.loadBuses(); }

  private loadBuses(): void {
    this.apollo.query<any>({ query: BUSES, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.buses) this.buses.set(r.data.buses); },
    });
  }

  setFilter(f: string): void { this.filter.set(f === this.filter() ? '' : f); }

  abrirModal(): void {
    import('./bus-modal.component').then((m) => {
      this.dialog.open(m.BusModalComponent, { width: '540px' }).afterClosed().subscribe((r) => {
        if (r) this.loadBuses();
      });
    });
  }

  getEstadoInfo(estado: string) { return ESTADO_BUS_MAP[estado] ?? { label: estado, variant: 'neutral' as BadgeVariant }; }
}
