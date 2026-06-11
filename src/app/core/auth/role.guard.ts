import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Rol } from './auth.service';

export function roleGuard(roles: Rol[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const usuario = auth.usuario();

    if (!usuario) {
      return router.createUrlTree(['/login']);
    }
    if (roles.includes(usuario.rol)) {
      return true;
    }
    return router.createUrlTree(['/app/dashboard']);
  };
}
