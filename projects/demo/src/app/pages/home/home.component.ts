import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsentService, IfConsentDirective } from '@ngrithms/cookie-consent';

@Component({
  selector: 'demo-home',
  standalone: true,
  imports: [IfConsentDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="demo-title">@ngrithms/cookie-consent</h1>
    <p class="demo-subtitle">
      Modern Angular cookie consent — standalone, signals, <code>provideCookieConsent()</code>,
      SSR-safe, zero runtime dependencies.
    </p>

    <section class="demo-section">
      <h2>Quick start</h2>
      <pre><code>{{ quickstart }}</code></pre>
    </section>

    <section class="demo-section">
      <h2>Reactive consent gating</h2>
      <p>
        Wrap any content in <code>*ngrIfConsent="'item-key'"</code> and it appears only when the
        user has granted consent for that item.
      </p>
      <div *ngrIfConsent="'google_analytics'; else gaPlaceholder">
        ✅ You consented to <strong>Google Analytics</strong>. (This block is gated.)
      </div>
      <ng-template #gaPlaceholder>
        <em>Enable Google Analytics in the consent banner to reveal hidden content.</em>
      </ng-template>
    </section>

    <section class="demo-section">
      <h2>Try it</h2>
      <div class="demo-grid">
        <button type="button" class="demo-btn" (click)="consent.acceptAll()">Accept all</button>
        <button type="button" class="demo-btn" (click)="consent.denyAll()">Reject all</button>
        <button type="button" class="demo-btn" (click)="consent.open()">Re-open banner</button>
        <button type="button" class="demo-btn" (click)="consent.openModal()">Open modal</button>
        <button type="button" class="demo-btn" (click)="consent.reset()">Reset decision</button>
      </div>
    </section>
  `,
})
export class HomeComponent {
  protected readonly consent = inject(ConsentService);

  protected readonly quickstart = `import { provideCookieConsent, ANALYTICS_PRESET } from '@ngrithms/cookie-consent';

bootstrapApplication(App, {
  providers: [
    provideCookieConsent({
      privacyPolicyUrl: '/privacy',
      categories: [ANALYTICS_PRESET],
    }),
  ],
});`;
}
