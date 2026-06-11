import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./boletos.component').then(m => m.BoletosComponent) },
];
