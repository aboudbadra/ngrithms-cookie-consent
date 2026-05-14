import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'demo-headless',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="demo-title">Headless mode</h1>
    <p class="demo-subtitle">
      Skip the theme imports entirely and style the consent UI from scratch. Components ship with
      semantic class names — your CSS does the rest.
    </p>

    <section class="demo-section">
      <h2>Config</h2>
      <pre><code>{{ configSnippet }}</code></pre>
    </section>

    <section class="demo-section">
      <h2>Style targets</h2>
      <p>Component class names you can target:</p>
      <ul>
        <li><code>.ngr-consent-banner</code> — banner root</li>
        <li><code>.ngr-consent-banner__title</code> — banner heading</li>
        <li><code>.ngr-consent-banner__btn--primary</code> — accept-all button</li>
        <li><code>.ngr-consent-modal</code> — modal root</li>
        <li><code>.ngr-consent-modal__switch</code> — per-item toggle</li>
        <li><code>.ngr-consent-badge</code> — floating opener</li>
      </ul>
    </section>

    <section class="demo-section">
      <h2>BYO styling example</h2>
      <pre><code>{{ cssSnippet }}</code></pre>
    </section>
  `,
})
export class HeadlessComponent {
  protected readonly configSnippet = `provideCookieConsent({
  theme: 'none',          // <- ship zero CSS from the library
  customClass: 'my-app-consent',
  categories: [/* ... */],
});`;

  protected readonly cssSnippet = `/* No theme import — style it however you like */

.my-app-consent {
  background: var(--brand-surface);
  color: var(--brand-text);
  /* etc. */
}

.my-app-consent .ngr-consent-banner__btn--primary {
  background: var(--brand-accent);
  color: white;
}`;
}
