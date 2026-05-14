import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';
import { ConsentService } from '@ngxt/cookie-consent';

type Preset = 'default' | 'dark' | 'minimal' | 'rounded';

/** Mirrors what each theme file applies, but as inline overrides so the demo can swap live. */
const THEME_OVERRIDES: Record<Preset, Record<string, string>> = {
  default: {},
  dark: {
    '--ngxt-banner-bg': '#0f172a',
    '--ngxt-banner-fg': '#e5e7eb',
    '--ngxt-banner-fg-muted': 'rgba(229, 231, 235, 0.7)',
    '--ngxt-banner-border': 'rgba(255, 255, 255, 0.08)',
    '--ngxt-modal-backdrop': 'rgba(0, 0, 0, 0.7)',
    '--ngxt-link': '#93c5fd',
    '--ngxt-btn-primary-bg': '#ffffff',
    '--ngxt-btn-primary-fg': '#0f172a',
    '--ngxt-btn-secondary-fg': '#e5e7eb',
    '--ngxt-btn-secondary-border': 'rgba(255, 255, 255, 0.2)',
    '--ngxt-btn-ghost-fg': '#93c5fd',
    '--ngxt-switch-on': '#93c5fd',
    '--ngxt-switch-off': 'rgba(255, 255, 255, 0.2)',
    '--ngxt-badge-bg': '#0f172a',
    '--ngxt-badge-fg': '#e5e7eb',
    '--ngxt-badge-border': 'rgba(255, 255, 255, 0.1)',
    '--ngxt-footer-bg': 'rgba(255, 255, 255, 0.03)',
  },
  minimal: {
    '--ngxt-banner-radius': '0',
    '--ngxt-banner-shadow': 'none',
    '--ngxt-btn-radius': '0',
    '--ngxt-item-radius': '0',
    '--ngxt-badge-radius': '0',
    '--ngxt-badge-shadow': '0 0 0 1px rgba(0, 0, 0, 0.12)',
  },
  rounded: {
    '--ngxt-banner-radius': '20px',
    '--ngxt-banner-padding': '24px 28px',
    '--ngxt-btn-radius': '999px',
    '--ngxt-btn-padding': '10px 20px',
    '--ngxt-item-radius': '16px',
    '--ngxt-badge-radius': '999px',
    '--ngxt-badge-size': '56px',
  },
};

@Component({
  selector: 'demo-theming',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="demo-title">Theming</h1>
    <p class="demo-subtitle">
      Switch the active theme. Each theme is a small CSS file that overrides the consent UI's CSS
      custom properties. Live preview below applies those same overrides inline so you can see
      the result immediately.
    </p>

    <section class="demo-section">
      <h2>Theme</h2>
      <div class="demo-grid">
        @for (option of themes; track option) {
          <button
            type="button"
            class="demo-btn"
            [class.demo-btn--primary]="active() === option"
            (click)="apply(option)"
          >
            {{ option }}
          </button>
        }
      </div>
      <p style="margin-top:16px">
        Then <button class="demo-btn" (click)="consent.open()">re-open the banner</button> to see
        the effect.
      </p>
    </section>

    <section class="demo-section">
      <h2>How it works</h2>
      <pre><code>{{ usage }}</code></pre>
      <p>Or define your own variables anywhere in your app's CSS:</p>
      <pre><code>{{ overrideExample }}</code></pre>
    </section>
  `,
})
export class ThemingComponent {
  protected readonly consent = inject(ConsentService);
  private readonly document = inject(DOCUMENT);

  protected readonly themes: Preset[] = ['default', 'dark', 'minimal', 'rounded'];
  protected readonly active = signal<Preset>('default');

  protected readonly usage = `/* In your global styles.scss */
@import '@ngxt/cookie-consent/themes/default.css';

/* or dark, minimal, rounded — or none at all for headless. */`;

  protected readonly overrideExample = `:root {
  --ngxt-btn-primary-bg: #4f46e5;
  --ngxt-banner-radius: 16px;
  --ngxt-switch-on: #16a34a;
}`;

  protected apply(theme: Preset): void {
    this.active.set(theme);
    this.clearOverrides();
    const root = this.document.documentElement;
    for (const [property, value] of Object.entries(THEME_OVERRIDES[theme])) {
      root.style.setProperty(property, value);
    }
  }

  private clearOverrides(): void {
    const root = this.document.documentElement;
    const allKeys = new Set<string>();
    for (const overrides of Object.values(THEME_OVERRIDES)) {
      for (const key of Object.keys(overrides)) allKeys.add(key);
    }
    for (const key of allKeys) root.style.removeProperty(key);
  }
}
