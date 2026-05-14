import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

/**
 * SSR-safe wrapper around `document.cookie`. All methods are no-ops on the server.
 *
 * Cookies are written with `SameSite=Lax`. When served over HTTPS they are also marked
 * `Secure` — matches what the Fenix fork does (avoids the localhost SSL trap where
 * `SameSite=None; Secure` is unusable without HTTPS).
 */
@Injectable({ providedIn: 'root' })
export class CookieService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  get(name: string): string | undefined {
    if (!this.isBrowser) return undefined;
    const match = this.document.cookie.match(
      new RegExp(`(?:^|; )${escapeRegex(name)}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : undefined;
  }

  set(name: string, value: string, expiryDays: number): void {
    if (!this.isBrowser) return;
    const expires = new Date(Date.now() + expiryDays * 86_400_000).toUTCString();
    const sameSite = this.isHttps() ? 'Lax; Secure' : 'Lax';
    this.document.cookie =
      `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=${sameSite}`;
  }

  delete(name: string): void {
    if (!this.isBrowser) return;
    this.document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  /** Get + JSON.parse in one step. Returns `undefined` if missing or malformed. */
  getJSON<T>(name: string): T | undefined {
    const raw = this.get(name);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }

  /** JSON.stringify + set in one step. */
  setJSON(name: string, value: unknown, expiryDays: number): void {
    this.set(name, JSON.stringify(value), expiryDays);
  }

  private isHttps(): boolean {
    return this.document.location?.protocol === 'https:';
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
