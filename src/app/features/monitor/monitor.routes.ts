import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./monitor.component').then(m => m.MonitorComponent) },
  { path: ':id', loadComponent: () => import('./monitor-detalle.component').then(m => m.MonitorDetalleComponent) },
];
