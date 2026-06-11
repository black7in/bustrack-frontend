import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./choferes.component').then(m => m.ChoferesComponent) },
];
