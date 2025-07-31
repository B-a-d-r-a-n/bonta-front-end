import { DOCUMENT } from '@angular/common';
import { effect, signal, PLATFORM_ID, Injectable, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  theme = signal<'light' | 'dark'>('light');

  constructor() {
    this.initializeTheme();
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const currentTheme = this.theme();
        if (currentTheme === 'dark') {
          this.document.documentElement.classList.add('dark');
        } else {
          this.document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', currentTheme);
      }
    });
  }

  private initializeTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      this.theme.set(initialTheme);
    }
  }

  toggleTheme() {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }
}
