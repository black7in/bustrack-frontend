import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./viajes.component').then(m => m.ViajesComponent) },
  { path: ':id', loadComponent: () => import('./viaje-detalle.component').then(m => m.ViajeDetalleComponent) },
];
