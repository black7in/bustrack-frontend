import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyBobPipe } from '../../shared/pipes/currency-bob.pipe';
import { LISTA_VENTAS } from '../../graphql/ventas.graphql';

interface BoletoItem {
  id: string;
  estado: string;
  precioPagado: number;
  fechaVenta?: string;
  pdfUrl?: string;
  cliente: { id: string; nombre: string; ci: string; telefono?: string };
  vendedor?: { nombre: string };
  viaje?: { fecha: string; horario?: { horaSalida: string; ruta?: { origen?: { ciudad: string }; destino?: { ciudad: string } } } };
  asiento?: { numeroAsiento: string | number };
  factura?: { numeroFactura?: string; monto?: number; hashSha256?: string; blockchainTxHash?: string; blockchainEstado?: string; pdfUrl?: string } | null;
}

const LIMIT = 20;

@Component({
  selector: 'app-boletos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, CurrencyBobPipe],
  templateUrl: './boletos.component.html',
  styleUrl: './boletos.component.scss',
})
export class BoletosComponent implements OnInit {
  private apollo = inject(Apollo);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly items = signal<BoletoItem[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);

  estadoFiltro = '';

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / LIMIT)));
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  readonly ESTADOS = [
    { value: '', label: 'Todos' },
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'USADO', label: 'Usado' },
    { value: 'ANULADO', label: 'Anulado' },
    { value: 'PENDIENTE', label: 'Pendiente' },
  ];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    const variables: any = { page: this.page(), limit: LIMIT };
    if (this.estadoFiltro) variables.estado = this.estadoFiltro;

    this.apollo.query<any>({ query: LISTA_VENTAS, variables, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => {
        this.loading.set(false);
        this.items.set(r.data?.boletos?.items ?? []);
        this.total.set(r.data?.boletos?.total ?? 0);
      },
      error: () => this.loading.set(false),
    });
  }

  aplicarFiltro(): void {
    this.page.set(1);
    this.cargar();
  }

  irPagina(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.cargar();
  }

  verPDF(url?: string): void { if (url) window.open(url, '_blank'); }

  verificarFactura(hash?: string): void {
    if (hash) this.router.navigate(['/verificar'], { queryParams: { hash } });
  }

  estadoClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ACTIVO': return 'badge-activo';
      case 'USADO': return 'badge-usado';
      case 'ANULADO': return 'badge-anulado';
      default: return 'badge-default';
    }
  }

  blockchainClass(estado?: string): string {
    switch (estado?.toUpperCase()) {
      case 'CONFIRMADO': return 'bc-ok';
      case 'PENDIENTE': return 'bc-pending';
      case 'FALLIDO': return 'bc-fail';
      default: return 'bc-none';
    }
  }

  formatFecha(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  minVal(a: number, b: number): number { return Math.min(a, b); }

  ruta(b: BoletoItem): string {
    const orig = b.viaje?.horario?.ruta?.origen?.ciudad;
    const dest = b.viaje?.horario?.ruta?.destino?.ciudad;
    if (!orig && !dest) return '—';
    return `${orig ?? '?'} → ${dest ?? '?'}`;
  }
}
