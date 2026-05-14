import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConsentService } from './consent.service';

/** Options for `ScriptLoaderService.load()`. */
export interface ScriptLoadOptions {
  /** `CookieItem.key` that must be granted before the script loads. */
  itemKey: string;
  /** URL of the script. */
  src?: string;
  /** Inline content (used if `src` is omitted). */
  inline?: string;
  /** `<script>` attributes (e.g. `async`, `defer`, `data-*`). */
  attrs?: Record<string, string | boolean>;
  /** Called once the script has loaded. */
  onLoad?: () => void;
}

/**
 * Defers third-party `<script>` injection until the user grants consent for a given
 * `CookieItem`. Safe to call during SSR — does nothing on the server.
 *
 * @example
 * scriptLoader.load({
 *   itemKey: 'google_analytics',
 *   src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXX',
 *   attrs: { async: true },
 *   onLoad: () => { (window as any).dataLayer ??= []; },
 * });
 */
@Injectable({ providedIn: 'root' })
export class ScriptLoaderService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly consent = inject(ConsentService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly loaded = new Set<string>();
  private readonly subscriptions = new Set<Subscription>();

  load(options: ScriptLoadOptions): void {
    if (!this.isBrowser) return;
    const dedupeKey = options.src ?? options.inline ?? options.itemKey;
    const sub = this.consent.item$(options.itemKey).subscribe((granted) => {
      if (granted && !this.loaded.has(dedupeKey)) {
        this.inject(options, dedupeKey);
      }
    });
    this.subscriptions.add(sub);
  }

  private inject(options: ScriptLoadOptions, dedupeKey: string): void {
    const script = this.document.createElement('script');
    if (options.src) script.src = options.src;
    if (options.inline) script.text = options.inline;
    if (options.attrs) {
      for (const [key, value] of Object.entries(options.attrs)) {
        if (value === false) continue;
        script.setAttribute(key, value === true ? '' : value);
      }
    }
    if (options.onLoad) script.addEventListener('load', options.onLoad);
    this.document.head.appendChild(script);
    this.loaded.add(dedupeKey);
  }
}
