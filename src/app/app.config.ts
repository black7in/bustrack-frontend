import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      const errorLink = new ErrorLink(({ error }) => {
        if (CombinedGraphQLErrors.is(error)) {
          for (const e of error.errors) {
            const ext = (e as any).extensions;
            if (ext?.statusCode === 401 || e.message === 'Unauthorized') {
              sessionStorage.removeItem('bustrack-token');
              sessionStorage.removeItem('bustrack-user');
              window.location.href = '/login';
            }
          }
        } else if ('status' in error && (error as any).status === 401) {
          sessionStorage.removeItem('bustrack-token');
          sessionStorage.removeItem('bustrack-user');
          window.location.href = '/login';
        }
      });

      const authLink = setContext((_, { headers }) => {
        const token = sessionStorage.getItem('bustrack-token');
        return {
          headers: {
            ...headers,
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
        };
      });

      const http = httpLink.create({
        uri: `${environment.apiUrl}/graphql`,
        withCredentials: true,
      });

      return {
        link: ApolloLink.from([authLink, errorLink, http]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
