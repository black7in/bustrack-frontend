import { Component, inject, signal, OnDestroy, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import * as L from 'leaflet';

@Component({
  selector: 'app-monitor-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './monitor-detalle.component.html',
  styleUrl: './monitor-detalle.component.scss',
})
export class MonitorDetalleComponent implements OnDestroy, AfterViewChecked {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly viajeId = signal('');
  readonly tab = signal<'gps' | 'abordaje' | 'conduccion'>('gps');
  readonly detalle = signal<any>(null);
  readonly rutaGps = signal<any>(null);
  readonly posActual = signal<any>(null);
  readonly abordaje = signal<any>(null);
  readonly resumen = signal<any>(null);
  readonly conduccion = signal<any[]>([]);

  private map: L.Map | null = null;
  private polyline: L.Polyline | null = null;
  private markerActual: L.Marker | null = null;
  private mapInitialized = false;

  constructor() {
    this.route.params.subscribe((p) => {
      this.viajeId.set(p['id']);
      this.mapInitialized = false;
      this.map?.remove();
      this.map = null;
      this.loadAll();
    });
  }

  private headers() { return new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`); }
  private api(path: string) { return `${environment.operacionesApiUrl}${path}`; }

  loadAll(): void {
    const id = this.viajeId();
    this.http.get<any>(this.api(`/viajes/${id}/detalle`), { headers: this.headers() }).subscribe({
      next: (r) => this.detalle.set(r),
    });
    this.loadTab();
  }

  loadTab(): void {
    const id = this.viajeId();
    if (this.tab() === 'gps') {
      this.http.get<any>(this.api(`/gps/viaje/${id}/ruta`), { headers: this.headers() }).subscribe({
        next: (r) => { this.rutaGps.set(r); this.renderMap(); },
      });
      this.http.get<any>(this.api(`/gps/viaje/${id}/actual`), { headers: this.headers() }).subscribe({
        next: (r) => { this.posActual.set(r); this.renderMap(); },
      });
    }
    if (this.tab() === 'abordaje') {
      this.http.get<any>(this.api(`/abordaje/viaje/${id}`), { headers: this.headers() }).subscribe({ next: (r) => this.abordaje.set(r) });
      this.http.get<any>(this.api(`/abordaje/viaje/${id}/resumen`), { headers: this.headers() }).subscribe({ next: (r) => this.resumen.set(r) });
    }
    if (this.tab() === 'conduccion') {
      this.http.get<any[]>(this.api(`/conduccion/viaje/${id}`), { headers: this.headers() }).subscribe({ next: (r) => this.conduccion.set(r ?? []) });
    }
  }

  ngAfterViewChecked(): void {
    if (this.tab() === 'gps' && !this.mapInitialized) {
      const el = document.getElementById('detalle-map');
      if (el && el.offsetHeight > 0) {
        this.mapInitialized = true;
        this.initMap();
        this.renderMap();
      }
    }
  }

  private initMap(): void {
    if (this.map) return;
    this.map = L.map('detalle-map').setView([-17.39, -66.15], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private renderMap(): void {
    if (!this.map) return;

    if (this.polyline) { this.map.removeLayer(this.polyline); this.polyline = null; }
    if (this.markerActual) { this.map.removeLayer(this.markerActual); this.markerActual = null; }

    const ruta = this.rutaGps();
    const actual = this.posActual();
    const bounds: L.LatLng[] = [];

    if (ruta?.puntos?.length) {
      const coords: L.LatLngTuple[] = ruta.puntos.map((p: any) => [p.lat, p.lng]);
      this.polyline = L.polyline(coords, { color: '#2563eb', weight: 3, opacity: 0.8 }).addTo(this.map);
      coords.forEach((c) => bounds.push(L.latLng(c)));
    }

    if (actual?.lat) {
      const pos: L.LatLngTuple = [actual.lat, actual.lng];
      this.markerActual = L.marker(pos).addTo(this.map).bindPopup(
        `<b>Posición actual</b><br>${actual.velocidadKmh} km/h<br>Rumbo: ${actual.rumbo ?? '—'}°<br>Hace ${actual.haceSegundos ?? '?'} seg`
      );
      bounds.push(L.latLng(pos));
    }

    if (bounds.length > 0) this.map.fitBounds(L.latLngBounds(bounds).pad(0.1));
  }

  setTab(t: 'gps' | 'abordaje' | 'conduccion'): void {
    this.tab.set(t);
    if (t === 'gps') { this.mapInitialized = false; }
    this.loadTab();
  }

  ngOnDestroy(): void { this.map?.remove(); }

  subtipoLabel(s: string): string {
    const m: Record<string, string> = { FRENAZO: 'Frenazo', ACELERACION: 'Aceleración brusca', CURVA: 'Curva peligrosa' };
    return m[s] || s;
  }
}
