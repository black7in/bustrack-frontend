import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'ventas', label: 'Venta de Boletos', icon: 'confirmation_number' },
  { id: 'boletos', label: 'Ventas', icon: 'receipt_long' },
  { id: 'viajes', label: 'Viajes', icon: 'alt_route' },
  { id: 'flota', label: 'Flota', icon: 'directions_bus' },
  { id: 'choferes', label: 'Choferes', icon: 'badge' },
  { id: 'monitor', label: 'Monitor', icon: 'map' },
  { id: 'rutas', label: 'Rutas', icon: 'location_on' },
  { id: 'tarifas', label: 'Tarifas', icon: 'sell' },
  { id: 'terminales', label: 'Terminales', icon: 'location_city' },
  { id: 'clientes', label: 'Clientes', icon: 'people' },
  { id: 'reportes', label: 'Reportes', icon: 'bar_chart' },
];

const OPERACION_IDS = ['dashboard', 'ventas', 'boletos', 'viajes', 'flota', 'choferes', 'monitor'];
const CATALOGO_IDS = ['rutas', 'tarifas', 'terminales', 'clientes', 'reportes'];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, MatRippleModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  activeRoute = input.required<string>();
  collapsed = input(false);
  userRole = input<'ADMIN' | 'VENDEDOR' | 'SUPERVISOR'>('ADMIN');
  navigate = output<string>();

  readonly allItems = NAV_ITEMS;

  get visibleItems(): NavItem[] {
    if (this.userRole() === 'VENDEDOR') {
      return NAV_ITEMS.filter((i) => i.id === 'ventas' || i.id === 'boletos');
    }
    return NAV_ITEMS;
  }

  get operacionItems(): NavItem[] {
    return this.visibleItems.filter((i) => OPERACION_IDS.includes(i.id));
  }

  get catalogoItems(): NavItem[] {
    return this.visibleItems.filter((i) => CATALOGO_IDS.includes(i.id));
  }

  isActive(id: string): boolean {
    return this.activeRoute() === id;
  }

  onNavigate(id: string): void {
    this.navigate.emit(id);
  }
}
