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
      <p>
        Three files — matches what <code>ng new</code> scaffolds on Angular 17+.
      </p>

      <h3 class="demo-step"><code>src/app/app.config.ts</code> — register the provider</h3>
      <pre><code>{{ appConfigSnippet }}</code></pre>

      <h3 class="demo-step">
        <code>src/app/app.component.ts</code> — import the standalone components & directive
      </h3>
      <pre><code>{{ appComponentSnippet }}</code></pre>

      <h3 class="demo-step"><code>src/app/app.component.html</code> — drop in the elements</h3>
      <pre><code>{{ appHtmlSnippet }}</code></pre>

      <h3 class="demo-step"><code>src/styles.css</code> — pick a theme (optional)</h3>
      <pre><code>{{ stylesSnippet }}</code></pre>

      <p style="margin-top:16px">
        That's it — no <code>main.ts</code> edits needed; the default Angular scaffold already
        passes <code>appConfig</code> into <code>bootstrapApplication</code>.
      </p>
    </section>

    <section class="demo-section">
      <h2>How it works</h2>
      <p>
        The library tracks which <code>CookieItem.key</code>s the user has granted. It does
        <strong>not</strong> load third-party SDKs or set their cookies — that's your job. Four
        patterns let you wire each key to the actual side effect:
      </p>
      <ul class="demo-patterns">
        <li>
          <strong>Structural directive</strong> — <code>*ngrIfConsent="'&lt;key&gt;'"</code> mounts /
          unmounts content (iframes, embeds, components) with consent.
        </li>
        <li>
          <strong>Script loader</strong> —
          <code>ScriptLoaderService.load(&#123; itemKey, src, ... &#125;)</code> injects a
          <code>&lt;script&gt;</code> tag on grant and removes it on revoke.
        </li>
        <li>
          <strong>Reactive state</strong> — <code>ConsentService.isGranted('&lt;key&gt;')</code>
          signal / <code>item$('&lt;key&gt;')</code> observable, callable from anywhere.
        </li>
        <li>
          <strong>Google Consent Mode v2</strong> —
          <code>applyGoogleConsentMode(consent, &#123; mapping, defaults &#125;)</code>, see the
          dedicated demo page.
        </li>
      </ul>
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
  styles: [
    `
      .demo-step {
        margin-top: 20px;
        font-size: 0.95rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.65);
      }
      .demo-patterns {
        padding-left: 20px;
        line-height: 1.6;
      }
      .demo-patterns li {
        margin-bottom: 8px;
      }
    `,
  ],
})
export class HomeComponent {
  protected readonly consent = inject(ConsentService);

  protected readonly appConfigSnippet = `import { ApplicationConfig } from '@angular/core';
import { provideCookieConsent, ANALYTICS_PRESET, MARKETING_PRESET } from '@ngrithms/cookie-consent';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCookieConsent({
      privacyPolicyUrl: '/privacy',
      categories: [ANALYTICS_PRESET, MARKETING_PRESET],
    }),
  ],
};`;

  protected readonly appComponentSnippet = `import { Component } from '@angular/core';
import { ConsentBannerComponent, ConsentBadgeComponent, IfConsentDirective } from '@ngrithms/cookie-consent';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ConsentBannerComponent, ConsentBadgeComponent, IfConsentDirective],
  templateUrl: './app.component.html',
})
export class AppComponent {}`;

  protected readonly appHtmlSnippet = `<ngr-consent-banner></ngr-consent-banner>
<ngr-consent-badge></ngr-consent-badge>

<div *ngrIfConsent="'google_analytics'">
  <!-- Only rendered if the user consented to Google Analytics. -->
</div>`;

  protected readonly stylesSnippet = `@import '@ngrithms/cookie-consent/themes/default.css';`;
}
