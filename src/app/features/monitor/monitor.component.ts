import { Component, inject, signal, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import * as L from 'leaflet';

interface ViajeActivo { viajeId: string; ruta: string; horaSalida: string; busPlaca: string; choferNombre: string; ultimaPosicion: { lat: number; lng: number; velocidadKmh: number; timestamp: string }; abordados: number; vendidos: number }

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

  ngAfterViewInit() {
    this.initMap();
  }

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
      next: (r) => { this.loading.set(false); if (r?.viajes) { this.viajes.set(r.viajes); this.updateMarkers(); } },
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
      const m = L.marker(pos).addTo(this.map).bindPopup(
        `<b>${v.busPlaca}</b><br>${v.ruta}<br>${v.choferNombre}<br>${v.ultimaPosicion.velocidadKmh} km/h<br><a href="/app/monitor/${v.viajeId}">Ver detalle</a>`
      );
      this.markers.push(m);
      bounds.push(L.latLng(pos));
    }
    if (bounds.length > 0) this.map.fitBounds(L.latLngBounds(bounds).pad(0.1));
  }

  getVelocidad(v: ViajeActivo): string { return v.ultimaPosicion?.velocidadKmh ? v.ultimaPosicion.velocidadKmh + ' km/h' : '---'; }
}
