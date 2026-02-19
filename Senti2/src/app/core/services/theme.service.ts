import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'senti2_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = new BehaviorSubject<Theme>(this.loadStoredTheme());

  get theme$(): Observable<Theme> {
    return this._theme.asObservable();
  }

  get currentTheme(): Theme {
    return this._theme.value;
  }

  get isDarkMode(): boolean {
    return this._theme.value === 'dark';
  }

  constructor() {
    this.applyTheme(this._theme.value);
  }

  private loadStoredTheme(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (_) {}
    return 'light';
  }

  toggle(): void {
    const next = this._theme.value === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  setTheme(theme: Theme): void {
    this._theme.next(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
  }
}
