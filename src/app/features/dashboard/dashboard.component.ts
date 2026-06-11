import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent, BadgeVariant } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyBobPipe } from '../../shared/pipes/currency-bob.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import { RESUMEN_VENTAS, VIAJES_DEL_DIA } from '../../graphql/dashboard.graphql';

interface ViajeItem {
  id: string;
  horario: { horaSalida: string; ruta: { id: string; origen: { nombre: string }; destino: { nombre: string } } };
  bus: { placa: string };
  choferTitular: { nombre: string };
  totalVendidos: number;
  asientos: number;
  estado: string;
}

type Periodo = 'hoy' | 'semana' | 'mes' | 'mes-anterior';

const ESTADO_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  in_route: { label: 'En ruta', variant: 'info' },
  boarding: { label: 'Embarcando', variant: 'warn' },
  scheduled: { label: 'Programado', variant: 'neutral' },
  delay: { label: 'Demorado', variant: 'err' },
  completed: { label: 'Completado', variant: 'ok' },
  cancelado: { label: 'Cancelado', variant: 'err' },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, DatePipe, RouterLink,
    MatIconModule, MatButtonModule, MatMenuModule,
    StatCardComponent, StatusBadgeComponent, CurrencyBobPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private apollo = inject(Apollo);
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly resumen = signal<any>(null);
  readonly viajes = signal<ViajeItem[]>([]);
  readonly loading = signal(true);

  readonly prediccion = signal<any>(null);
  readonly segmentacion = signal<any>(null);

  readonly periodo = signal<Periodo>('hoy');
  readonly customStart = signal<string | null>(null);
  readonly customEnd = signal<string | null>(null);
  readonly ingresosRutaData = signal<any[]>([]);
  readonly ingresosDiaActual = signal<number>(0);
  readonly ingresosDiaAnterior = signal<number>(0);
  readonly resumenAnterior = signal<any>(null);

  readonly today = new Date();

  readonly hoy = signal(this.fmt(this.today));

  readonly fechaInicio = computed(() => {
    const p = this.periodo();
    if (p === 'hoy') return this.fmt(this.today);
    if (p === 'semana') {
      const d = new Date(this.today);
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      d.setDate(d.getDate() + diff);
      return this.fmt(d);
    }
    if (p === 'mes-anterior') return this.fmt(new Date(this.today.getFullYear(), this.today.getMonth() - 1, 1));
    return this.fmt(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
  });

  readonly fechaFin = computed(() => {
    const p = this.periodo();
    if (p === 'mes') {
      const lastDay = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0);
      return this.fmt(lastDay);
    }
    if (p === 'mes-anterior') {
      const lastDay = new Date(this.today.getFullYear(), this.today.getMonth(), 0);
      return this.fmt(lastDay);
    }
    return this.fmt(this.today);
  });

  readonly periodoLabel = computed(() => {
    const p = this.periodo();
    if (p === 'hoy') return 'Hoy';
    if (p === 'semana') return 'Ultimos 7 dias';
    if (p === 'mes-anterior') return 'Mes anterior';
    return 'Este mes';
  });

  readonly boletosHoy = computed(() => this.resumen()?.totalBoletos ?? 0);
  readonly ingresosHoy = computed(() => this.resumen()?.totalIngresos ?? 0);
  readonly viajesProgramados = computed(() => this.resumen()?.viajesHoy ?? 0);
  readonly ocupacionPromedio = computed(() => this.resumen()?.ocupacionPromedio ?? 0);

  readonly viajesEnOperacion = computed(() =>
    this.viajes().filter((v) => v.estado === 'in_route' || v.estado === 'boarding').length
  );

  readonly ocupacionPorRuta = computed(() => {
    const rutas = new Map<string, { ocupaciones: number[]; count: number }>();
    for (const v of this.viajes()) {
      const key = `${v.horario.ruta.origen.nombre} → ${v.horario.ruta.destino.nombre}`;
      const entry = rutas.get(key) || { ocupaciones: [], count: 0 };
      entry.ocupaciones.push((v.totalVendidos / v.asientos) * 100);
      entry.count++;
      rutas.set(key, entry);
    }
    return Array.from(rutas.entries())
      .map(([ruta, data]) => ({
        ruta,
        ocupacion: Math.round(data.ocupaciones.reduce((a, b) => a + b, 0) / data.ocupaciones.length),
        viajes: data.count,
      }))
      .sort((a, b) => b.ocupacion - a.ocupacion)
      .slice(0, 5);
  });

  constructor() {
    effect(() => this.loadData());
  }

  ngOnInit(): void {}

  setPeriodo(value: Periodo): void {
    this.periodo.set(value);
  }

  onCustomRangeChange(start: Date, end: Date): void {
    this.customStart.set(this.fmt(start));
    this.customEnd.set(this.fmt(end));
  }

  private loadData(): void {
    this.loading.set(true);
    const inicio = this.fechaInicio();
    const fin = this.fechaFin();
    const hoy = this.fmt(this.today);

    this.apollo
      .query<any>({ query: RESUMEN_VENTAS, variables: { fechaInicio: inicio, fechaFin: fin }, fetchPolicy: 'network-only' })
      .subscribe({
        next: (result) => {
          if (result.data?.resumenVentas) {
            this.resumen.set(result.data.resumenVentas);
          }
        },
        error: () => this.loading.set(false),
      });

    this.apollo
      .query<any>({ query: VIAJES_DEL_DIA, variables: { fecha: inicio, page: 1, limit: 10 }, fetchPolicy: 'network-only' })
      .subscribe({
        next: (result) => {
          if (result.data?.viajes?.items) {
            this.viajes.set(result.data.viajes.items);
          }
        },
        error: () => this.loading.set(false),
        complete: () => this.loading.set(false),
      });

    this.loadPrediccion();
    this.loadSegmentacion();
  }

  private headers() { return new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`); }
  private ops(path: string) { return `${environment.operacionesApiUrl}${path}`; }

  private loadPrediccion(): void {
    const token = this.auth.getToken();
    if (!token) return;
    const ruta = this.viajes()[0];
    const rutaId = ruta?.horario?.ruta?.id;
    this.http.get<any>(`${environment.iaApiUrl}/prediccion/demanda`, {
      headers: this.headers(),
      params: { rutaId: rutaId || 'default', fecha: this.fechaInicio() },
    }).subscribe({ next: (r) => this.prediccion.set(r), error: (e) => console.warn('Prediccion IA:', e.status) });
  }

  private loadSegmentacion(): void {
    if (!this.auth.getToken()) return;
    this.http.get<any>(`${environment.iaApiUrl}/segmentacion/clientes`, { headers: this.headers() }).subscribe({ next: (r) => this.segmentacion.set(r) });
  }

  getEstadoInfo(estado: string): { label: string; variant: BadgeVariant } {
    return ESTADO_MAP[estado] ?? { label: estado, variant: 'neutral' };
  }

  getOcupacionClass(occ: number, cap: number): string {
    const pct = (occ / cap) * 100;
    if (pct >= 95) return 'bar-err';
    if (pct >= 80) return 'bar-warn';
    return 'bar-ok';
  }

  getTotalSemana(): number {
    return this.ingresosRutaData().reduce((sum: number, r: any) => sum + (r.ingresos || 0), 0);
  }

  private fmt(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
