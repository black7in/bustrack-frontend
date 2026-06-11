import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { GraphQLService } from '../graphql/graphql.service';

export type Rol = 'ADMIN' | 'VENDEDOR' | 'SUPERVISOR';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  terminalId?: string | null;
}

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      usuario {
        id
        nombre
        email
        rol
        terminalId
      }
    }
  }
`;

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apollo = inject(Apollo);
  private router = inject(Router);
  private graphqlService = inject(GraphQLService);

  readonly usuario = signal<Usuario | null>(null);

  constructor() {
    this.loadStoredUser();
  }

  getToken(): string | null {
    return this.graphqlService.getToken();
  }

  getTerminalId(): string | null {
    const token = this.graphqlService.getToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    return payload?.terminalId ?? null;
  }

  login(email: string, password: string) {
    return this.apollo.mutate<{ login: { token: string; usuario: Usuario } }>({
      mutation: LOGIN_MUTATION,
      variables: { email, password },
    });
  }

  handleLoginSuccess(token: string, usuario: Usuario): void {
    this.graphqlService.setToken(token);
    const payload = decodeJwtPayload(token);
    if (payload?.terminalId) {
      usuario.terminalId = payload.terminalId;
    }
    this.usuario.set(usuario);
    sessionStorage.setItem('bustrack-user', JSON.stringify(usuario));
    const redirect = usuario.rol === 'VENDEDOR' ? '/app/ventas' : '/app/dashboard';
    this.router.navigate([redirect]);
  }

  logout(): void {
    this.graphqlService.setToken(null);
    this.usuario.set(null);
    sessionStorage.removeItem('bustrack-user');
    this.router.navigate(['/login']);
  }

  private loadStoredUser(): void {
    try {
      const raw = sessionStorage.getItem('bustrack-user');
      if (raw) {
        this.usuario.set(JSON.parse(raw));
      }
    } catch { /* ignore */ }
  }
}
