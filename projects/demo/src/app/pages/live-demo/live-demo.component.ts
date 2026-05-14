import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsentService, IfConsentDirective } from '@ngrithms/cookie-consent';

@Component({
  selector: 'demo-live',
  standalone: true,
  imports: [IfConsentDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="demo-title">Live demo</h1>
    <p class="demo-subtitle">
      Interact with the banner and badge above. Reactive gates below update in real time as
      consent changes.
    </p>

    <section class="demo-section">
      <h2>State</h2>
      <pre><code>{{ stateJson() }}</code></pre>
    </section>

    <section class="demo-section">
      <h2>Reactive gates</h2>
      @for (key of ['google_analytics', 'hotjar', 'meta_pixel', 'youtube']; track key) {
        <div class="gate">
          <code>{{ key }}</code>
          <span>
            <ng-container *ngrIfConsent="key; else off">✅ granted</ng-container>
            <ng-template #off>⛔ denied</ng-template>
          </span>
        </div>
      }
    </section>

    <section class="demo-section">
      <h2>Controls</h2>
      <div class="demo-grid">
        <button class="demo-btn demo-btn--primary" (click)="consent.acceptAll()">Accept all</button>
        <button class="demo-btn" (click)="consent.denyAll()">Reject all</button>
        <button class="demo-btn" (click)="consent.open()">Re-open banner</button>
        <button class="demo-btn" (click)="consent.openModal()">Open modal</button>
        <button class="demo-btn" (click)="consent.reset()">Reset</button>
      </div>
    </section>
  `,
  styles: [
    `
      .gate {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
      }
      .gate:first-child {
        border-top: 0;
      }
    `,
  ],
})
export class LiveDemoComponent {
  protected readonly consent = inject(ConsentService);

  protected stateJson() {
    return JSON.stringify(this.consent.state(), null, 2);
  }
}
