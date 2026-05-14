import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
  ConsentService,
  GoogleConsentMapping,
  applyGoogleConsentMode,
  consentToGoogleConsentObject,
} from '@ngrithms/cookie-consent';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const MAPPING: GoogleConsentMapping = {
  google_analytics: 'analytics_storage',
  google_ads: ['ad_storage', 'ad_user_data', 'ad_personalization'],
};

@Component({
  selector: 'demo-ga-consent-mode',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="demo-title">Google Consent Mode v2</h1>
    <p class="demo-subtitle">
      Forward consent decisions to <code>gtag('consent', 'update', ...)</code> automatically. The
      adapter calls <code>gtag</code> once on init with defaults, then again whenever consent
      changes.
    </p>

    <section class="demo-section">
      <h2>Setup</h2>
      <pre><code>{{ setupSnippet }}</code></pre>
    </section>

    <section class="demo-section">
      <h2>Live forwarding</h2>
      <p>
        A fake <code>gtag</code> is installed for this page. Toggle consent in the banner and watch
        the most recent <code>'consent', 'update'</code> payload appear here:
      </p>
      <pre><code>{{ lastUpdate() }}</code></pre>
      <p>
        Static preview of <code>consentToGoogleConsentObject()</code> for the current state
        (without subscribing):
      </p>
      <pre><code>{{ currentObject() }}</code></pre>
    </section>
  `,
})
export class GaConsentModeComponent implements OnInit, OnDestroy {
  protected readonly consent = inject(ConsentService);

  protected readonly lastUpdate = signal<string>('(awaiting first consent change)');

  private teardown: (() => void) | null = null;
  private originalGtag: typeof window.gtag | undefined;

  protected readonly setupSnippet = `import { applyGoogleConsentMode } from '@ngrithms/cookie-consent';

applyGoogleConsentMode(consentService, {
  mapping: {
    google_analytics: 'analytics_storage',
    google_ads: ['ad_storage', 'ad_user_data', 'ad_personalization'],
  },
  defaults: {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  },
});`;

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    this.originalGtag = window.gtag;
    window.gtag = (...args: unknown[]) => {
      if (args[0] === 'consent' && args[1] === 'update') {
        this.lastUpdate.set(JSON.stringify(args[2], null, 2));
      }
    };
    this.teardown = applyGoogleConsentMode(this.consent, {
      mapping: MAPPING,
      defaults: {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      },
    });
  }

  ngOnDestroy(): void {
    this.teardown?.();
    if (typeof window !== 'undefined') {
      window.gtag = this.originalGtag;
    }
  }

  protected currentObject(): string {
    const obj = consentToGoogleConsentObject(this.consent.state(), MAPPING);
    return JSON.stringify(obj, null, 2);
  }
}
