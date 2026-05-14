import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ConsentService } from '@ngrithms/cookie-consent';

type Preset = 'default' | 'dark' | 'minimal' | 'rounded';

/** Mirrors what each theme file applies, but as inline overrides so the demo can swap live. */
const THEME_OVERRIDES: Record<Preset, Record<string, string>> = {
  default: {},
  dark: {
    '--ngrithms-banner-bg': '#0f172a',
    '--ngrithms-banner-fg': '#e5e7eb',
    '--ngrithms-banner-fg-muted': 'rgba(229, 231, 235, 0.7)',
    '--ngrithms-banner-border': 'rgba(255, 255, 255, 0.08)',
    '--ngrithms-modal-backdrop': 'rgba(0, 0, 0, 0.7)',
    '--ngrithms-link': '#93c5fd',
    '--ngrithms-btn-primary-bg': '#ffffff',
    '--ngrithms-btn-primary-fg': '#0f172a',
    '--ngrithms-btn-secondary-fg': '#e5e7eb',
    '--ngrithms-btn-secondary-border': 'rgba(255, 255, 255, 0.2)',
    '--ngrithms-btn-ghost-fg': '#93c5fd',
    '--ngrithms-switch-on': '#93c5fd',
    '--ngrithms-switch-off': 'rgba(255, 255, 255, 0.2)',
    '--ngrithms-badge-bg': '#0f172a',
    '--ngrithms-badge-fg': '#e5e7eb',
    '--ngrithms-badge-border': 'rgba(255, 255, 255, 0.1)',
    '--ngrithms-footer-bg': 'rgba(255, 255, 255, 0.03)',
  },
  minimal: {
    '--ngrithms-banner-radius': '0',
    '--ngrithms-banner-shadow': 'none',
    '--ngrithms-btn-radius': '0',
    '--ngrithms-item-radius': '0',
    '--ngrithms-badge-radius': '0',
    '--ngrithms-badge-shadow': '0 0 0 1px rgba(0, 0, 0, 0.12)',
  },
  rounded: {
    '--ngrithms-banner-radius': '20px',
    '--ngrithms-banner-padding': '24px 28px',
    '--ngrithms-btn-radius': '999px',
    '--ngrithms-btn-padding': '10px 20px',
    '--ngrithms-item-radius': '16px',
    '--ngrithms-badge-radius': '999px',
    '--ngrithms-badge-size': '56px',
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
@import '@ngrithms/cookie-consent/themes/default.css';

/* or dark, minimal, rounded — or none at all for headless. */`;

  protected readonly overrideExample = `:root {
  --ngrithms-btn-primary-bg: #4f46e5;
  --ngrithms-banner-radius: 16px;
  --ngrithms-switch-on: #16a34a;
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
