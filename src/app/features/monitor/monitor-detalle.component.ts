import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-monitor-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './monitor-detalle.component.html',
  styleUrl: './monitor-detalle.component.scss',
})
export class MonitorDetalleComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  readonly viajeId = signal('');
  readonly tab = signal<'gps' | 'abordaje' | 'conduccion'>('gps');
  readonly detalle = signal<any>(null);
  readonly ruta = signal<any>(null);
  readonly abordaje = signal<any>(null);
  readonly resumen = signal<any>(null);
  readonly conduccion = signal<any[]>([]);
  readonly score = signal<any>(null);

  constructor() {
    this.route.params.subscribe((p) => { this.viajeId.set(p['id']); this.loadAll(); });
  }

  private headers() { return new HttpHeaders().set('Authorization', `Bearer ${this.auth.getToken()}`); }
  private api(path: string) { return `${environment.operacionesApiUrl}${path}`; }

  loadAll(): void {
    const id = this.viajeId();
    this.http.get<any>(this.api(`/viajes/${id}/detalle`), { headers: this.headers() }).subscribe({ next: (r) => this.detalle.set(r) });
    this.loadTab();
  }

  loadTab(): void {
    const id = this.viajeId();
    if (this.tab() === 'gps') {
      this.http.get<any>(this.api(`/gps/viaje/${id}/ruta`), { headers: this.headers() }).subscribe({ next: (r) => this.ruta.set(r) });
      this.http.get<any>(this.api(`/gps/viaje/${id}/actual`), { headers: this.headers() }).subscribe();
    }
    if (this.tab() === 'abordaje') {
      this.http.get<any>(this.api(`/abordaje/viaje/${id}`), { headers: this.headers() }).subscribe({ next: (r) => this.abordaje.set(r) });
      this.http.get<any>(this.api(`/abordaje/viaje/${id}/resumen`), { headers: this.headers() }).subscribe({ next: (r) => this.resumen.set(r) });
    }
    if (this.tab() === 'conduccion') {
      this.http.get<any[]>(this.api(`/conduccion/viaje/${id}`), { headers: this.headers() }).subscribe({ next: (r) => this.conduccion.set(r) });
    }
  }

  setTab(t: 'gps' | 'abordaje' | 'conduccion'): void { this.tab.set(t); this.loadTab(); }

  subtipoLabel(s: string): string {
    const m: Record<string, string> = { FRENAZO: 'Frenazo', ACELERACION: 'Aceleracion brusca', CURVA: 'Curva peligrosa' };
    return m[s] || s;
  }
}
