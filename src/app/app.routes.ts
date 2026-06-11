import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'app',
    loadComponent: () => import('./shared/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'SUPERVISOR'])],
      },
      {
        path: 'ventas',
        loadChildren: () => import('./features/ventas/ventas.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'VENDEDOR', 'SUPERVISOR'])],
      },
      {
        path: 'boletos',
        loadChildren: () => import('./features/boletos/boletos.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'VENDEDOR', 'SUPERVISOR'])],
      },
      {
        path: 'viajes',
        loadChildren: () => import('./features/viajes/viajes.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'SUPERVISOR'])],
      },
      {
        path: 'flota',
        loadChildren: () => import('./features/flota/flota.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'SUPERVISOR'])],
      },
      {
        path: 'choferes',
        loadChildren: () => import('./features/choferes/choferes.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'SUPERVISOR'])],
      },
      {
        path: 'monitor',
        loadChildren: () => import('./features/monitor/monitor.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'SUPERVISOR'])],
      },
      {
        path: 'rutas',
        loadChildren: () => import('./features/rutas/rutas.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'SUPERVISOR'])],
      },
      {
        path: 'horarios',
        loadChildren: () => import('./features/horarios/horarios.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'SUPERVISOR'])],
      },
      {
        path: 'tarifas',
        loadChildren: () => import('./features/tarifas/tarifas.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'SUPERVISOR'])],
      },
      {
        path: 'terminales',
        loadChildren: () => import('./features/terminales/terminales.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'SUPERVISOR'])],
      },
      {
        path: 'clientes',
        loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'VENDEDOR', 'SUPERVISOR'])],
      },
      {
        path: 'reportes',
        loadChildren: () => import('./features/reportes/reportes.routes').then(m => m.routes),
        canActivate: [roleGuard(['ADMIN', 'SUPERVISOR'])],
      },
    ],
  },
  {
    path: 'verificar',
    loadComponent: () => import('./features/verificar/verificar.component').then(m => m.VerificarComponent),
  },
  { path: '**', redirectTo: '/login' },
];

