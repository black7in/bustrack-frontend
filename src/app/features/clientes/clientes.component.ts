import { Component, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CLIENTES, BOLETOS_POR_CLIENTE } from '../../graphql/clientes.graphql';

interface ClienteItem { id: string; ci: string; nombre: string; telefono?: string; email?: string }
interface BoletoItem { id: string; fechaVenta: string; precioPagado: number; estado: string; asiento: { numeroAsiento: string }; viaje: { id: string; fecha: string; horario: { horaSalida: string; ruta: { origen: { nombre: string }; destino: { nombre: string } } } } }

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss',
})
export class ClientesComponent {
  private apollo = inject(Apollo);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  readonly clientes = signal<ClienteItem[]>([]);
  readonly clienteSeleccionado = signal<ClienteItem | null>(null);
  readonly boletos = signal<BoletoItem[]>([]);
  readonly loading = signal(false);
  readonly clienteSegmento = signal<any>(null);

  readonly searchTerm = signal('');
  private search$ = new Subject<string>();

  constructor() {
    this.search$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
      this.loadClientes(term);
    });
    this.loadClientes('');
  }

  onSearch(val: string): void {
    this.searchTerm.set(val);
    this.search$.next(val);
  }

  private loadClientes(busqueda: string): void {
    this.loading.set(true);
    this.apollo.query<any>({
      query: CLIENTES,
      variables: busqueda ? { busqueda } : {},
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (r) => {
        this.loading.set(false);
        if (r.data?.clientes) this.clientes.set(r.data.clientes);
      },
      error: () => this.loading.set(false),
    });
  }

  verBoletos(cliente: ClienteItem): void {
    this.clienteSeleccionado.set(cliente);
    this.boletos.set([]);
    this.clienteSegmento.set(null);
    this.apollo.query<any>({
      query: BOLETOS_POR_CLIENTE,
      variables: { clienteId: cliente.id },
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (r) => { if (r.data?.boletos) this.boletos.set(r.data.boletos); },
      error: (err) => this.snackBar.open(err.message || 'Error al cargar boletos', 'Cerrar', { duration: 3000 }),
    });
    const token = this.auth.getToken();
    if (token) {
      this.http.get<any>(`${environment.iaApiUrl}/segmentacion/cliente/${cliente.id}`, {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
      }).subscribe({ next: (r) => this.clienteSegmento.set(r) });
    }
  }

  cerrarDetalle(): void {
    this.clienteSeleccionado.set(null);
    this.boletos.set([]);
    this.clienteSegmento.set(null);
  }

  cerrarDetalle(): void {
    this.clienteSeleccionado.set(null);
    this.boletos.set([]);
  }
}
