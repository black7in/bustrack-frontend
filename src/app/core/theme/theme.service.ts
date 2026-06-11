import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'bustrack-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeMode>('light');
  private document: Document;

  constructor(@Inject(DOCUMENT) document: Document, @Inject(PLATFORM_ID) private platformId: object) {
    this.document = document;
    const saved = isPlatformBrowser(this.platformId) ? localStorage.getItem(THEME_KEY) : null;
    if (saved === 'dark' || saved === 'light') {
      this.applyTheme(saved);
    } else if (isPlatformBrowser(this.platformId) && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.applyTheme('dark');
    } else {
      this.applyTheme('light');
    }
  }

  toggle(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
  }

  private applyTheme(mode: ThemeMode): void {
    this.theme.set(mode);
    this.document.documentElement.setAttribute('data-theme', mode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(THEME_KEY, mode);
    }
  }
}
