import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./reportes.component').then(m => m.ReportesComponent) },
];
