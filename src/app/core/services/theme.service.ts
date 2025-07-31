import { DOCUMENT } from '@angular/common';
import { effect, signal, PLATFORM_ID, Injectable, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  theme = signal<'light' | 'dark'>(this.getInitialThemeFromDom());

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const currentTheme = this.theme();

        if (currentTheme === 'dark') {
          this.document.documentElement.classList.add('dark');
        } else {
          this.document.documentElement.classList.remove('dark');
        }

        // Persist the user's choice.
        localStorage.setItem('theme', currentTheme);
      }
    });
  }

  private getInitialThemeFromDom(): 'light' | 'dark' {
    if (isPlatformBrowser(this.platformId)) {
      return this.document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light';
    }
    return 'light';
  }

  toggleTheme() {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }
}
