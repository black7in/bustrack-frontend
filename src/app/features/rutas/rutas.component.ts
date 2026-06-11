import { Component, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RUTAS, ACTUALIZAR_RUTA } from '../../graphql/catalogo.graphql';

interface RutaItem { id: string; origen: { id: string; nombre: string; ciudad: string }; destino: { id: string; nombre: string; ciudad: string }; distanciaKm?: number; duracionEstimadaMin?: number; activa: boolean }
interface TerminalItem { id: string; nombre: string; ciudad: string }

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './rutas.component.html',
  styleUrl: './rutas.component.scss',
})
export class RutasComponent {
  private apollo = inject(Apollo);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly rutas = signal<RutaItem[]>([]);

  constructor() { this.load(); }

  load(): void {
    this.apollo.query<any>({ query: RUTAS, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.rutas) this.rutas.set(r.data.rutas); },
    });
  }

  abrirModal(): void {
    import('./ruta-modal.component').then((m) => {
      this.dialog.open(m.RutaModalComponent).afterClosed().subscribe((r) => { if (r) this.load(); });
    });
  }

  editar(ruta: RutaItem): void {
    import('./ruta-modal.component').then((m) => {
      this.dialog.open(m.RutaModalComponent, { data: ruta }).afterClosed().subscribe((r) => { if (r) this.load(); });
    });
  }

  toggleActiva(ruta: RutaItem): void {
    const nuevo = !ruta.activa;
    this.apollo.mutate<any>({ mutation: ACTUALIZAR_RUTA, variables: { id: ruta.id, input: { activa: nuevo } } }).subscribe({
      next: () => {
        this.snackBar.open(nuevo ? 'Ruta activada' : 'Ruta desactivada', 'Cerrar', { duration: 3000 });
        this.load();
      },
      error: (e: any) => this.snackBar.open(e.message || 'Error', 'Cerrar', { duration: 3000 }),
    });
  }
}
