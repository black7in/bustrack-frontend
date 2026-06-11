import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./horarios.component').then(m => m.HorariosComponent) },
];
