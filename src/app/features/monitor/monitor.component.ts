import { Component, inject, signal, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import * as L from 'leaflet';

interface UltimaPosicion { lat: number; lng: number; velocidadKmh: number; timestamp: string }
interface ViajeActivo { viajeId: string; ultimaPosicion: UltimaPosicion; abordados: number }

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.scss',
})
export class MonitorComponent implements OnInit, OnDestroy, AfterViewInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  readonly viajes = signal<ViajeActivo[]>([]);
  readonly loading = signal(false);
  private interval?: any;
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  ngOnInit() { this.load(); this.interval = setInterval(() => this.load(), 30000); }
  ngOnDestroy() { clearInterval(this.interval); if (this.map) this.map.remove(); }
  ngAfterViewInit() { this.initMap(); }

  private initMap() {
    if (this.map) return;
    this.map = L.map('monitor-map').setView([-17.39, -66.15], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private headers() { return new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`); }

  load(): void {
    this.loading.set(true);
    this.http.get<any>(`${environment.operacionesApiUrl}/viajes/activos`, { headers: this.headers() }).subscribe({
      next: (r) => {
        this.loading.set(false);
        if (r?.viajes) { this.viajes.set(r.viajes); this.updateMarkers(); }
      },
      error: () => this.loading.set(false),
    });
  }

  private updateMarkers() {
    if (!this.map) return;
    this.markers.forEach((m) => this.map!.removeLayer(m));
    this.markers = [];
    const bounds: L.LatLng[] = [];
    for (const v of this.viajes()) {
      if (!v.ultimaPosicion?.lat) continue;
      const pos: L.LatLngTuple = [v.ultimaPosicion.lat, v.ultimaPosicion.lng];
      const popup = [
        `<b>Viaje ${v.viajeId.slice(0, 8)}...</b>`,
        `Abordados: ${v.abordados}`,
        `Velocidad: ${v.ultimaPosicion.velocidadKmh} km/h`,
        `<a href="/app/monitor/${v.viajeId}">Ver detalle</a>`,
      ].join('<br>');
      const m = L.marker(pos).addTo(this.map!).bindPopup(popup);
      this.markers.push(m);
      bounds.push(L.latLng(pos));
    }
    if (bounds.length > 0) this.map.fitBounds(L.latLngBounds(bounds).pad(0.1));
  }

  getVelocidad(v: ViajeActivo): string {
    return v.ultimaPosicion?.velocidadKmh != null ? v.ultimaPosicion.velocidadKmh + ' km/h' : '---';
  }

  formatTimestamp(ts?: string): string {
    if (!ts) return '---';
    return new Date(ts).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  }
}
