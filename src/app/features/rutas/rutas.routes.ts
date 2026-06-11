import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./rutas.component').then(m => m.RutasComponent) },
  { path: ':id', loadComponent: () => import('./ruta-detalle.component').then(m => m.RutaDetalleComponent) },
];
