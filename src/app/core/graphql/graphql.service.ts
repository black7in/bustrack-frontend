import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GraphQLService {
  private token: string | null = null;

  constructor() {
    this.token = sessionStorage.getItem('bustrack-token');
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      sessionStorage.setItem('bustrack-token', token);
    } else {
      sessionStorage.removeItem('bustrack-token');
    }
  }
}
