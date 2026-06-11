import { Component, inject, signal, computed } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StatusBadgeComponent, BadgeVariant } from '../../shared/components/status-badge/status-badge.component';
import { CHOFERES } from '../../graphql/flota.graphql';

interface ChoferItem { id: string; nombre: string; ci: string; licenciaCategoria: string; licenciaNumero: string; licenciaVence: string; telefono?: string; estado: string; fotoPerfilUrl?: string }

const ESTADO_CHOFER_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  DISPONIBLE: { label: 'Disponible', variant: 'ok' },
  EN_VIAJE: { label: 'En viaje', variant: 'info' },
  DESCANSANDO: { label: 'Descanso', variant: 'neutral' },
  INACTIVO: { label: 'Inactivo', variant: 'err' },
};

@Component({
  selector: 'app-choferes',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule, MatButtonModule, MatDialogModule, StatusBadgeComponent],
  templateUrl: './choferes.component.html',
  styleUrl: './choferes.component.scss',
})
export class ChoferesComponent {
  private apollo = inject(Apollo);
  private dialog = inject(MatDialog);
  readonly choferes = signal<ChoferItem[]>([]);

  readonly stats = computed(() => ({
    total: this.choferes().length,
    disponible: this.choferes().filter((c) => c.estado?.toUpperCase() === 'DISPONIBLE').length,
    enViaje: this.choferes().filter((c) => c.estado?.toUpperCase() === 'EN_VIAJE').length,
    licenciaProxima: this.choferes().filter((c) => {
      if (!c.licenciaVence) return false;
      const vence = new Date(c.licenciaVence);
      const diff = (vence.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    }).length,
  }));

  constructor() { this.loadChoferes(); }

  private loadChoferes(): void {
    this.apollo.query<any>({ query: CHOFERES, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.choferes) this.choferes.set(r.data.choferes); },
    });
  }

  getEstadoInfo(estado: string) { return ESTADO_CHOFER_MAP[estado?.toUpperCase()] ?? { label: estado || '---', variant: 'neutral' as BadgeVariant }; }

  licenciaUrgente(vence: string): boolean {
    if (!vence) return false;
    const d = new Date(vence);
    const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }

  abrirModal(): void {
    import('./chofer-modal.component').then((m) => {
      this.dialog.open(m.ChoferModalComponent, { width: '520px' }).afterClosed().subscribe((r) => {
        if (r) this.loadChoferes();
      });
    });
  }
}
