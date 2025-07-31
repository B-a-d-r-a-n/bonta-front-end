import { effect, signal, PLATFORM_ID, Injectable, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  theme = signal<'light' | 'dark'>('light');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme') as
        | 'light'
        | 'dark'
        | null;
      if (savedTheme) {
        this.theme.set(savedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.theme.set('dark');
      }
    }

    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        document.documentElement.classList.toggle(
          'dark',
          this.theme() === 'dark'
        );
        localStorage.setItem('theme', this.theme());
      }
    });
  }

  toggleTheme() {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }
}
