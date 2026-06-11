import { Component, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HORARIOS_POR_RUTA as HORARIOS } from '../../graphql/catalogo.graphql';

interface HorarioItem { id: string; horaSalida: string; diasSemana: number[]; activo: boolean; ruta: { id: string; origen: { nombre: string }; destino: { nombre: string } } }

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss',
})
export class HorariosComponent {
  private apollo = inject(Apollo);
  private dialog = inject(MatDialog);
  readonly horarios = signal<HorarioItem[]>([]);
  readonly filterActivo = signal(true);

  constructor() { this.load(); }

  setFilter(v: boolean) { this.filterActivo.set(v); this.load(); }

  abrirModal(): void {
    import('./horario-modal.component').then((m) => {
      this.dialog.open(m.HorarioModalComponent).afterClosed().subscribe((r) => { if (r) this.load(); });
    });
  }

  private load(): void {
    this.apollo.query<any>({
      query: HORARIOS, variables: { activo: this.filterActivo() }, fetchPolicy: 'network-only',
    }).subscribe({
      next: (r) => { if (r.data?.horarios) this.horarios.set(r.data.horarios); },
    });
  }

  diasLabel(dias: number[]): string {
    if (!dias?.length) return '---';
    const map = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    return dias.map((d) => map[d]).join(', ');
  }
}
