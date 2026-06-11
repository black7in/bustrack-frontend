import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

interface ViajeActivo { viajeId: string; ruta: string; horaSalida: string; busPlaca: string; choferNombre: string; ultimaPosicion: { lat: number; lng: number; velocidadKmh: number; timestamp: string }; abordados: number; vendidos: number }

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.scss',
})
export class MonitorComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  readonly viajes = signal<ViajeActivo[]>([]);
  readonly loading = signal(false);
  private interval?: any;

  ngOnInit() { this.load(); this.interval = setInterval(() => this.load(), 30000); }
  ngOnDestroy() { clearInterval(this.interval); }

  private headers() { return new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`); }

  load(): void {
    this.loading.set(true);
    this.http.get<any>(`${environment.operacionesApiUrl}/viajes/activos`, { headers: this.headers() }).subscribe({
      next: (r) => { this.loading.set(false); if (r?.viajes) this.viajes.set(r.viajes); },
      error: () => this.loading.set(false),
    });
  }

  getVelocidad(v: ViajeActivo): string { return v.ultimaPosicion?.velocidadKmh ? v.ultimaPosicion.velocidadKmh + ' km/h' : '---'; }
}
