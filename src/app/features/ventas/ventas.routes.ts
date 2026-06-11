import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./ventas.component').then(m => m.VentasComponent) },
];
