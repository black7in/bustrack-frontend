import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/theme/theme.service';

const HEADER_DATA: Record<string, { title: string; subtitle: string; breadcrumbs: string[] }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Resumen general', breadcrumbs: ['Operacion', 'Dashboard'] },
  ventas: { title: 'Venta de Boletos', subtitle: 'Buscar y emitir', breadcrumbs: ['Operacion', 'Venta de Boletos'] },
  viajes: { title: 'Viajes', subtitle: 'Programacion y operacion', breadcrumbs: ['Operacion', 'Viajes'] },
  flota: { title: 'Flota', subtitle: 'Buses registrados', breadcrumbs: ['Operacion', 'Flota'] },
  choferes: { title: 'Choferes', subtitle: 'Conductores profesionales', breadcrumbs: ['Operacion', 'Choferes'] },
  monitor: { title: 'Monitor', subtitle: 'Buses en tiempo real', breadcrumbs: ['Operacion', 'Monitor'] },
  rutas: { title: 'Rutas', subtitle: 'Origen, destino y paradas', breadcrumbs: ['Catalogo', 'Rutas'] },
  horarios: { title: 'Horarios', subtitle: 'Horarios por ruta', breadcrumbs: ['Catalogo', 'Horarios'] },
  tarifas: { title: 'Tarifas', subtitle: 'Precios y promociones', breadcrumbs: ['Catalogo', 'Tarifas'] },
  terminales: { title: 'Terminales', subtitle: 'Gestion de terminales', breadcrumbs: ['Catalogo', 'Terminales'] },
  clientes: { title: 'Clientes', subtitle: 'Gestion de pasajeros', breadcrumbs: ['Catalogo', 'Clientes'] },
  reportes: { title: 'Reportes', subtitle: 'Indicadores y exportacion', breadcrumbs: ['Catalogo', 'Reportes'] },
};

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    SidebarComponent,
    HeaderComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  readonly isDark = this.themeService.theme.asReadonly();
  readonly collapsed = computed(() => false);
  readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd)
    ).subscribe(() => this.currentUrl.set(this.router.url));
  }

  readonly currentRoute = computed(() => {
    const url = this.currentUrl();
    const segment = url.split('/').pop() || 'dashboard';
    return segment in HEADER_DATA ? segment : 'dashboard';
  });

  readonly headerInfo = computed(() => HEADER_DATA[this.currentRoute()] ?? HEADER_DATA['dashboard']);

  readonly usuario = computed(() => this.auth.usuario() ?? { id: '', nombre: 'Usuario', email: '', rol: 'ADMIN' as const, terminalId: null });

  readonly userRoleLabel = computed(() => {
    const rol = this.usuario().rol;
    if (rol === 'ADMIN') return 'Administrador';
    if (rol === 'SUPERVISOR') return 'Supervisor';
    return 'Vendedor';
  });

  readonly userInitials = computed(() => {
    const name = this.usuario().nombre;
    return name
      .split(' ')
      .map((part: string) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';
  });

  onToggleTheme(): void {
    this.themeService.toggle();
  }

  onLogout(): void {
    this.auth.logout();
  }

  onNavigate(route: string): void {
    this.router.navigate(['/app', route]);
  }
}
