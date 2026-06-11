import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./tarifas.component').then(m => m.TarifasComponent) },
];
