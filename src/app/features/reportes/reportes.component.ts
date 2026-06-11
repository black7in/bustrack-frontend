import { Component, inject, signal, computed } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrencyBobPipe } from '../../shared/pipes/currency-bob.pipe';
import { ChartDirective } from '../../shared/components/chart/chart.directive';
import { REPORTE_VENTAS, BOLETOS_REPORTE, INGRESOS_POR_RUTA, INGRESOS_POR_DIA, OCUPACION_POR_RUTA_QUERY, REPORTE_INTELIGENTE } from '../../graphql/reportes.graphql';
import { RUTAS } from '../../graphql/catalogo.graphql';

interface BoletoItem { id: string; fechaVenta: string; precioPagado: number; asiento: { numeroAsiento: string }; cliente: { nombre: string; ci: string }; viaje: { fecha: string; horario: { horaSalida: string; ruta: { origen: { nombre: string }; destino: { nombre: string } } } } }

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSnackBarModule, CurrencyBobPipe, ChartDirective],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent {
  private apollo = inject(Apollo);
  private snackBar = inject(MatSnackBar);

  readonly Math = Math;

  readonly tab = signal<'ventas' | 'ocupacion' | 'ingresos' | 'ia'>('ventas');
  readonly rutas = signal<any[]>([]);
  readonly loading = signal(false);
  readonly iaQuery = signal('');
  readonly iaResult = signal<any>(null);
  readonly iaLoading = signal(false);
  readonly resumen = signal<any>(null);
  readonly boletos = signal<BoletoItem[]>([]);
  readonly boletosTotal = signal(0);
  readonly page = signal(1);

  readonly fechaInicio = signal(new Date().toISOString().split('T')[0]);
  readonly fechaFin = signal(new Date().toISOString().split('T')[0]);
  readonly rutaId = signal('');
  readonly rutaOcupacionId = signal('');
  readonly OCupacionFechaInicio = signal(new Date().toISOString().split('T')[0]);
  readonly OCupacionFechaFin = signal(new Date().toISOString().split('T')[0]);

  readonly ocupacionData = signal<any[]>([]);

  readonly kpiTicketPromedio = computed(() => {
    const r = this.resumen();
    if (!r || !r.totalBoletos) return 0;
    return Math.round(r.totalIngresos / r.totalBoletos);
  });

  readonly ventasChartOptions = computed(() => ({
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['Ingresos', 'Boletos'], bottom: 0, textStyle: { color: 'var(--color-text-secondary)', fontSize: 11 } },
    grid: { left: 55, right: 20, top: 20, bottom: 35 },
    xAxis: { type: 'category' as const, data: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'], axisLabel: { color: 'var(--color-text-secondary)', fontSize: 10 } },
    yAxis: { type: 'value' as const, axisLabel: { color: 'var(--color-text-secondary)', fontSize: 10, formatter: (v: number) => (v / 1000).toFixed(0) + 'k' }, splitLine: { lineStyle: { color: 'var(--color-divider)' } } },
    series: [
      { name: 'Ingresos', type: 'bar', data: [0, 0, 0, 0, 0, 0, 0], itemStyle: { color: 'var(--brand-600)', borderRadius: [6, 6, 0, 0] }, barGap: '10%' },
      { name: 'Boletos', type: 'line', data: [0, 0, 0, 0, 0, 0, 0], smooth: true, lineStyle: { color: 'var(--accent-500)', width: 2 }, itemStyle: { color: 'var(--accent-500)' }, symbolSize: 6 },
    ],
  }));

  readonly ocupacionChartOptions = signal<any>({
    tooltip: { trigger: 'axis' as const, formatter: '{b}<br/>Ocupacion: {c}%' },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category' as const, data: ['Sin datos'], axisLabel: { color: '#6B7480', fontSize: 10 } },
    yAxis: { type: 'value' as const, min: 0, max: 100, axisLabel: { color: '#6B7480', fontSize: 10, formatter: '{value}%' }, splitLine: { lineStyle: { color: '#EEF1F5' } } },
    series: [
      { type: 'line', data: [0], smooth: true, areaStyle: { color: '#E5EEF6' }, lineStyle: { color: '#1E4E78', width: 2 }, itemStyle: { color: '#1E4E78' }, symbolSize: 4 },
      { type: 'line', data: [], markLine: { silent: true, data: [{ yAxis: 80 }], lineStyle: { color: '#F59E0B', type: 'dashed', width: 1.5 }, label: { formatter: '80%', position: 'end', fontSize: 10, color: '#F59E0B' } } },
    ],
  });

  readonly ingresosRutaData = signal<any[]>([]);
  readonly resumenAnterior = signal<any>(null);
  readonly ingresosDiaActual = signal<any[]>([]);
  readonly ingresosDiaAnterior = signal<any[]>([]);

  readonly ingresosSummary = computed(() => {
    const data = this.ingresosRutaData();
    if (!data.length) return { total: 0, rutaTop: '---', diaTop: '---' };
    const total = data.reduce((s: number, d: any) => s + d.totalIngresos, 0);
    const sorted = [...data].sort((a, b) => b.totalIngresos - a.totalIngresos);
    const rutaTop = sorted[0]?.ruta?.origen?.nombre + ' \u2192 ' + sorted[0]?.ruta?.destino?.nombre || '---';
    return { total, rutaTop, diaTop: '---' };
  });

  readonly ocupacionPromedioOcc = computed(() => {
    const d = this.ocupacionData(); if (!d.length) return 0;
    return Math.round(d.reduce((s: number, x: any) => s + x.porcentaje, 0) / d.length);
  });
  readonly ocupacionMaximaOcc = computed(() => {
    const d = this.ocupacionData(); if (!d.length) return 0;
    return Math.max(...d.map((x: any) => x.porcentaje));
  });
  readonly ocupacionMinimaOcc = computed(() => {
    const d = this.ocupacionData(); if (!d.length) return 0;
    return Math.min(...d.map((x: any) => x.porcentaje));
  });

  readonly comparacion = computed(() => {
    const actual = this.resumen()?.totalIngresos || 0;
    const anterior = this.resumenAnterior()?.totalIngresos || 0;
    if (!anterior) return { actual, anterior, pct: 0, up: true };
    const pct = Math.round(((actual - anterior) / anterior) * 100);
    return { actual, anterior, pct, up: pct >= 0 };
  });

  readonly ingresosBarrasOptions = computed(() => {
    const data = this.ingresosRutaData();
    if (!data.length) return {
      tooltip: { trigger: 'axis' as const },
      grid: { left: 110, right: 20, top: 10, bottom: 25 },
      xAxis: { type: 'value' as const, axisLabel: { color: 'var(--color-text-secondary)', fontSize: 10 } },
      yAxis: { type: 'category' as const, data: ['Sin datos'], axisLabel: { color: 'var(--color-text-secondary)', fontSize: 11 } },
      series: [{ type: 'bar', data: [0], itemStyle: { color: 'var(--brand-600)' } }],
    };
    const sorted = [...data].sort((a, b) => b.totalIngresos - a.totalIngresos);
    return {
      tooltip: { trigger: 'axis' as const, formatter: (p: any) => p[0]?.name + '<br/>Ingresos: Bs ' + p[0]?.value?.toLocaleString() },
      grid: { left: 160, right: 40, top: 10, bottom: 25 },
      xAxis: { type: 'value' as const, axisLabel: { color: 'var(--color-text-secondary)', fontSize: 10, formatter: (v: number) => (v / 1000).toFixed(0) + 'k' }, splitLine: { lineStyle: { color: 'var(--color-divider)' } } },
      yAxis: { type: 'category' as const, data: sorted.map((d) => d.ruta.origen.nombre + ' \u2192 ' + d.ruta.destino.nombre), axisLabel: { color: 'var(--color-text-secondary)', fontSize: 11 } },
      series: [{ type: 'bar', data: sorted.map((d) => d.totalIngresos), itemStyle: { color: 'var(--brand-600)', borderRadius: [0, 6, 6, 0] }, barCategoryGap: '30%' }],
    };
  });

  readonly comparativoOptions = signal<any>({
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['Mes actual', 'Mes anterior'], bottom: 0, textStyle: { color: 'var(--color-text-secondary)', fontSize: 11 } },
    grid: { left: 55, right: 20, top: 20, bottom: 35 },
    xAxis: { type: 'category' as const, data: Array.from({ length: 31 }, (_, i) => (i + 1).toString()), axisLabel: { color: 'var(--color-text-secondary)', fontSize: 10 } },
    yAxis: { type: 'value' as const, axisLabel: { color: 'var(--color-text-secondary)', fontSize: 10, formatter: (v: number) => (v / 1000).toFixed(0) + 'k' }, splitLine: { lineStyle: { color: 'var(--color-divider)' } } },
    series: [
      { name: 'Mes actual', type: 'line', data: Array(31).fill(0), smooth: true, lineStyle: { color: '#0B2942', width: 2 }, itemStyle: { color: '#0B2942' }, symbolSize: 3 },
      { name: 'Mes anterior', type: 'line', data: Array(31).fill(0), smooth: true, lineStyle: { color: '#9AA4B2', width: 2, type: 'dashed' }, itemStyle: { color: '#9AA4B2' }, symbolSize: 3 },
    ],
  });

  constructor() {
    this.apollo.query<any>({ query: RUTAS, fetchPolicy: 'network-only' }).subscribe({ next: (r) => { if (r.data?.rutas) this.rutas.set(r.data.rutas); } });
  }

  consultar(): void {
    if (this.tab() === 'ventas') this.loadVentas();
    else if (this.tab() === 'ingresos') this.loadIngresos();
  }

  private loadVentas(): void {
    this.loading.set(true);
    const fini = this.fechaInicio(); const ffin = this.fechaFin();
    this.apollo.query<any>({ query: REPORTE_VENTAS, variables: { fechaInicio: fini, fechaFin: ffin }, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.resumenVentas) this.resumen.set(r.data.resumenVentas); },
      error: () => {},
    });
    this.apollo.query<any>({ query: BOLETOS_REPORTE, variables: { page: this.page(), limit: 20 }, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { this.loading.set(false); if (r.data?.boletos) { this.boletos.set(r.data.boletos.items); this.boletosTotal.set(r.data.boletos.total); } },
      error: () => this.loading.set(false),
    });
  }

  private loadIngresos(): void {
    this.loading.set(true);
    const hoy = new Date();
    const mesAnteriorIni = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().split('T')[0];
    const mesAnteriorFin = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().split('T')[0];

    this.apollo.query<any>({
      query: INGRESOS_POR_RUTA,
      variables: { fechaInicio: this.fechaInicio(), fechaFin: this.fechaFin() },
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (r) => { if (r.data?.ingresosPorRuta) this.ingresosRutaData.set(r.data.ingresosPorRuta); },
    });

    this.apollo.query<any>({
      query: REPORTE_VENTAS,
      variables: { fechaInicio: this.fechaInicio(), fechaFin: this.fechaFin() },
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (r) => { if (r.data?.resumenVentas) this.resumen.set(r.data.resumenVentas); },
    });

    this.apollo.query<any>({
      query: REPORTE_VENTAS,
      variables: { fechaInicio: mesAnteriorIni, fechaFin: mesAnteriorFin },
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (r) => { if (r.data?.resumenVentas) this.resumenAnterior.set(r.data.resumenVentas); },
    });

    this.apollo.query<any>({
      query: INGRESOS_POR_DIA,
      variables: { fechaInicio: this.fechaInicio(), fechaFin: this.fechaFin() },
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (r) => { if (r.data?.ingresosPorDia) this.ingresosDiaActual.set(r.data.ingresosPorDia); },
      error: () => {},
    });

    this.apollo.query<any>({
      query: INGRESOS_POR_DIA,
      variables: { fechaInicio: mesAnteriorIni, fechaFin: mesAnteriorFin },
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (r) => { this.loading.set(false); if (r.data?.ingresosPorDia) { this.ingresosDiaAnterior.set(r.data.ingresosPorDia); this.buildComparativo(); } },
      error: () => this.loading.set(false),
    });
  }

  consultarOcupacion(): void {
    this.loading.set(true);
    const rutaId = this.rutaOcupacionId();
    if (!rutaId) { this.loading.set(false); return; }
    this.apollo.query<any>({
      query: OCUPACION_POR_RUTA_QUERY,
      variables: { fechaInicio: this.OCupacionFechaInicio(), fechaFin: this.OCupacionFechaFin(), rutaId },
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (r) => {
        this.loading.set(false);
        if (r.data?.ocupacionPorRuta) {
          this.ocupacionData.set(r.data.ocupacionPorRuta);
          this.buildOcupacionChart();
        }
      },
      error: () => this.loading.set(false),
    });
  }

  private buildOcupacionChart(): void {
    const data = this.ocupacionData();
    const fechas = data.map((d: any) => new Date(parseInt(d.fecha)).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' }));
    const pcts = data.map((d: any) => d.porcentaje);
    this.ocupacionChartOptions.set({
      ...this.ocupacionChartOptions(),
      xAxis: { ...this.ocupacionChartOptions().xAxis, data: fechas.length ? fechas : ['Sin datos'] },
      series: [
        { ...this.ocupacionChartOptions().series[0], data: pcts.length ? pcts : [0] },
        this.ocupacionChartOptions().series[1],
      ],
    });
  }

  private buildComparativo(): void {
    const actual = this.ingresosDiaActual();
    const anterior = this.ingresosDiaAnterior();
    const dataActual: number[] = new Array(31).fill(0);
    const dataAnterior: number[] = new Array(31).fill(0);
    for (const item of actual) {
      const d = new Date(parseInt(item.fecha)).getDate();
      if (d >= 1 && d <= 31) dataActual[d - 1] = item.totalIngresos;
    }
    for (const item of anterior) {
      const d = new Date(parseInt(item.fecha)).getDate();
      if (d >= 1 && d <= 31) dataAnterior[d - 1] = item.totalIngresos;
    }
    this.comparativoOptions.set({
      ...this.comparativoOptions(),
      series: [
        { ...this.comparativoOptions().series[0], data: dataActual },
        { ...this.comparativoOptions().series[1], data: dataAnterior },
      ],
    });
  }

  exportarCSV(): void {
    if (!this.boletos().length) return;
    const h = 'Fecha,Ruta,Pasajero,CI,Asiento,Precio\n';
    const r = this.boletos().map((b) => `${b.fechaVenta},${b.viaje.horario.ruta.origen.nombre}-${b.viaje.horario.ruta.destino.nombre},${b.cliente.nombre},${b.cliente.ci},${b.asiento.numeroAsiento},${b.precioPagado}`).join('\n');
    const blob = new Blob([h + r], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `reporte-ventas-${this.fechaInicio()}-${this.fechaFin()}.csv`; a.click();
    window.URL.revokeObjectURL(url);
    this.snackBar.open('CSV exportado', 'Cerrar', { duration: 2000 });
  }

  setPreset(p: string): void {
    const hoy = new Date();
    if (p === 'hoy') { this.fechaInicio.set(hoy.toISOString().split('T')[0]); this.fechaFin.set(hoy.toISOString().split('T')[0]); }
    else if (p === 'semana') { const ini = new Date(hoy); ini.setDate(hoy.getDate() - hoy.getDay() + 1); this.fechaInicio.set(ini.toISOString().split('T')[0]); this.fechaFin.set(hoy.toISOString().split('T')[0]); }
    else if (p === 'mes') { this.fechaInicio.set(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`); this.fechaFin.set(hoy.toISOString().split('T')[0]); }
    else if (p === 'mes-anterior') { const m = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1); const ult = new Date(hoy.getFullYear(), hoy.getMonth(), 0); this.fechaInicio.set(m.toISOString().split('T')[0]); this.fechaFin.set(ult.toISOString().split('T')[0]); }
  }

  consultarIA(): void {
    const p = this.iaQuery().trim();
    if (!p) return;
    this.iaLoading.set(true);
    this.iaResult.set(null);
    this.apollo.query<any>({ query: REPORTE_INTELIGENTE, variables: { pregunta: p }, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { this.iaLoading.set(false); this.iaResult.set(r.data?.reporteInteligente || null); },
      error: (e) => { this.iaLoading.set(false); this.iaResult.set({ error: e.message || 'Error de conexion' }); },
    });
  }

  exportarIACSV(): void {
    const r = this.iaResult(); if (!r?.columnas?.length) return;
    const h = r.columnas.join(',') + '\n';
    const rows = r.filas.map((f: any[]) => f.join(',')).join('\n');
    const blob = new Blob([h + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'reporte-ia.csv'; a.click();
    window.URL.revokeObjectURL(url);
  }
}
