import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ConsentService, LanguageService } from '@ngrithms/cookie-consent';

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

const OUTLINE_CUSTOMIZE_VARS: Record<string, string> = {
  '--ngrithms-btn-ghost-bg': 'transparent',
  '--ngrithms-btn-ghost-fg': '#1f2937',
  '--ngrithms-btn-ghost-border': 'rgba(0, 0, 0, 0.16)',
  '--ngrithms-btn-ghost-bg-hover': 'rgba(0, 0, 0, 0.04)',
  '--ngrithms-btn-ghost-border-hover': 'rgba(0, 0, 0, 0.24)',
  '--ngrithms-btn-ghost-text-decoration-hover': 'none',
};

/** Comprehensive brand-styled override: banner geometry + indigo palette + pill buttons + accent badge. */
const BRAND_MAKEOVER_VARS: Record<string, string> = {
  // Banner — color, geometry, glow (body text stays in the indigo-navy palette)
  '--ngrithms-banner-bg': '#ffffff',
  '--ngrithms-banner-fg': '#1e1b4b',
  '--ngrithms-banner-fg-muted': 'rgba(30, 27, 75, 0.7)',
  '--ngrithms-banner-border': '#e0e7ff',
  '--ngrithms-banner-radius': '20px',
  '--ngrithms-banner-padding': '24px 28px',
  '--ngrithms-banner-shadow': '0 20px 50px rgba(79, 70, 229, 0.18)',
  '--ngrithms-banner-max-width': '760px',
  '--ngrithms-link': '#4f46e5',
  // Buttons — pill shape, indigo brand. Only the "Settings" (ghost) button gets black text.
  '--ngrithms-btn-radius': '999px',
  '--ngrithms-btn-padding': '10px 22px',
  '--ngrithms-btn-primary-bg': '#4f46e5',
  '--ngrithms-btn-primary-fg': '#ffffff',
  '--ngrithms-btn-primary-bg-hover': '#4338ca',
  '--ngrithms-btn-secondary-fg': '#4f46e5',
  '--ngrithms-btn-secondary-border': '#c7d2fe',
  '--ngrithms-btn-secondary-bg-hover': 'rgba(79, 70, 229, 0.08)',
  '--ngrithms-btn-ghost-fg': '#4f46e5',
  '--ngrithms-btn-ghost-fg-hover': '#1e1b4b',
  '--ngrithms-btn-ghost-text-decoration-hover': 'none',
  // Switches — brand color when granted
  '--ngrithms-switch-on': '#4f46e5',
  // Badge — solid indigo with brand glow
  '--ngrithms-badge-bg': '#4f46e5',
  '--ngrithms-badge-fg': '#ffffff',
  '--ngrithms-badge-border': 'transparent',
  '--ngrithms-badge-shadow': '0 8px 24px rgba(79, 70, 229, 0.35)',
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

    <section class="demo-section">
      <h2>CSS variables reference</h2>
      <p>
        Every visual aspect of the consent UI is themable via CSS custom properties. Here are the
        main surfaces — the full set lives in the lib's <code>themes/*.css</code> files.
      </p>

      <h3 class="demo-step">Banner</h3>
      <table class="vars-table">
        <tbody>
          <tr><td><code>--ngrithms-banner-bg</code></td><td>Banner background</td></tr>
          <tr><td><code>--ngrithms-banner-fg</code></td><td>Text color</td></tr>
          <tr><td><code>--ngrithms-banner-fg-muted</code></td><td>Description / secondary text</td></tr>
          <tr><td><code>--ngrithms-banner-border</code></td><td>Border color</td></tr>
          <tr><td><code>--ngrithms-banner-radius</code></td><td>Corner radius</td></tr>
          <tr><td><code>--ngrithms-banner-padding</code></td><td>Inner padding</td></tr>
          <tr><td><code>--ngrithms-banner-shadow</code></td><td>Drop shadow</td></tr>
          <tr><td><code>--ngrithms-banner-max-width</code></td><td>Max width</td></tr>
          <tr><td><code>--ngrithms-banner-gap</code></td><td>Inset from viewport edge</td></tr>
          <tr><td><code>--ngrithms-link</code></td><td>Privacy / imprint link color</td></tr>
        </tbody>
      </table>

      <h3 class="demo-step">Buttons</h3>
      <table class="vars-table">
        <tbody>
          <tr><td><code>--ngrithms-btn-radius</code></td><td>Corner radius (shared)</td></tr>
          <tr><td><code>--ngrithms-btn-padding</code></td><td>Padding (shared)</td></tr>
          <tr>
            <td><code>--ngrithms-btn-primary-bg</code> / <code>-fg</code> / <code>-bg-hover</code></td>
            <td>Accept-all button colors</td>
          </tr>
          <tr>
            <td>
              <code>--ngrithms-btn-secondary-bg</code> / <code>-fg</code> / <code>-border</code> /
              <code>-bg-hover</code>
            </td>
            <td>Reject-all button colors</td>
          </tr>
          <tr>
            <td>
              <code>--ngrithms-btn-ghost-bg</code> / <code>-fg</code> / <code>-border</code> /
              <code>-bg-hover</code> / <code>-fg-hover</code> / <code>-border-hover</code> /
              <code>-padding-inline</code> / <code>-text-decoration-hover</code>
            </td>
            <td>
              Customize button. Defaults to a borderless link style — set bg/border to give it
              a real outline (recipe below).
            </td>
          </tr>
        </tbody>
      </table>

      <h3 class="demo-step">Badge (floating opener)</h3>
      <table class="vars-table">
        <tbody>
          <tr><td><code>--ngrithms-badge-bg</code></td><td>Background</td></tr>
          <tr><td><code>--ngrithms-badge-fg</code></td><td>Foreground (icon inherits via currentColor)</td></tr>
          <tr><td><code>--ngrithms-badge-border</code></td><td>Border color</td></tr>
          <tr><td><code>--ngrithms-badge-radius</code></td><td>Corner radius (default <code>999px</code> = circle)</td></tr>
          <tr><td><code>--ngrithms-badge-size</code></td><td>Width &amp; height</td></tr>
          <tr><td><code>--ngrithms-badge-shadow</code></td><td>Drop shadow</td></tr>
          <tr><td><code>--ngrithms-badge-offset</code></td><td>Inset from viewport edge</td></tr>
          <tr>
            <td><code>--ngrithms-badge-icon-fill</code></td>
            <td>
              <strong>New in 0.4.0.</strong> Icon fill, independent of the badge text color.
              Defaults to <code>currentColor</code>.
            </td>
          </tr>
        </tbody>
      </table>

      <h3 class="demo-step">Modal switches</h3>
      <table class="vars-table">
        <tbody>
          <tr><td><code>--ngrithms-switch-on</code></td><td>Track color when granted</td></tr>
          <tr><td><code>--ngrithms-switch-off</code></td><td>Track color when denied</td></tr>
        </tbody>
      </table>
    </section>

    <section class="demo-section">
      <h2>Recipe: outline-style Customize button</h2>
      <p>
        By default the Customize button is borderless (link-style). Toggle below to set the new
        ghost-button CSS vars and give it a real outline matching Reject all:
      </p>
      <div class="demo-grid">
        <button
          type="button"
          class="demo-btn"
          [class.demo-btn--primary]="outlineCustomize()"
          (click)="toggleOutlineCustomize()"
        >
          {{ outlineCustomize() ? 'Outline applied — click to revert' : 'Apply outline' }}
        </button>
        <button type="button" class="demo-btn" (click)="consent.open()">Open banner</button>
      </div>
      <p style="margin-top:16px">The CSS being applied:</p>
      <pre><code>{{ outlineSnippet }}</code></pre>
    </section>

    <section class="demo-section">
      <h2>Recipe: full brand makeover</h2>
      <p>
        A comprehensive override touching banner geometry, brand colors, pill-shaped buttons,
        accent-colored switches, and a solid-indigo badge. The toggle also activates a custom
        language pack that renames the Customize button to <strong>Settings</strong> — about 20
        CSS variables plus one <code>setLanguage()</code> call. Toggle below to see it all:
      </p>
      <div class="demo-grid">
        <button
          type="button"
          class="demo-btn"
          [class.demo-btn--primary]="brandMakeover()"
          (click)="toggleBrandMakeover()"
        >
          {{ brandMakeover() ? 'Makeover applied — click to revert' : 'Apply brand makeover' }}
        </button>
        <button type="button" class="demo-btn" (click)="consent.open()">Open banner</button>
        <button type="button" class="demo-btn" (click)="consent.openModal()">Open modal</button>
      </div>
      <p style="margin-top:16px">
        Open the banner <em>and</em> the modal to see the changes propagate — the switches inside
        the modal pick up <code>--ngrithms-switch-on</code>, and the floating badge (visible once
        you've decided) picks up the indigo background.
      </p>

      <h3 class="demo-step">1. CSS variables (paste into your global stylesheet)</h3>
      <pre><code>{{ brandMakeoverCssSnippet }}</code></pre>

      <h3 class="demo-step">2. Custom translation pack (registers "Settings" copy)</h3>
      <pre><code>{{ brandMakeoverLangSnippet }}</code></pre>
    </section>
  `,
  styles: [
    `
      .demo-step {
        margin-top: 24px;
        font-size: 0.95rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.65);
      }
      .vars-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
        margin-top: 8px;
      }
      .vars-table td {
        padding: 8px 12px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        vertical-align: top;
      }
      .vars-table tr:first-child td {
        border-top: 0;
      }
      .vars-table td:first-child {
        width: 42%;
      }
      .vars-table code {
        font-size: 0.85em;
        white-space: nowrap;
      }
    `,
  ],
})
export class ThemingComponent {
  protected readonly consent = inject(ConsentService);
  private readonly document = inject(DOCUMENT);
  private readonly i18n = inject(LanguageService);

  protected readonly themes: Preset[] = ['default', 'dark', 'minimal', 'rounded'];
  protected readonly active = signal<Preset>('default');
  protected readonly outlineCustomize = signal(false);
  protected readonly brandMakeover = signal(false);
  private previousLanguage = 'en';

  protected readonly usage = `/* In your global styles.scss */
@import '@ngrithms/cookie-consent/themes/default.css';

/* or dark, minimal, rounded — or none at all for headless. */`;

  protected readonly overrideExample = `:root {
  --ngrithms-btn-primary-bg: #4f46e5;
  --ngrithms-banner-radius: 16px;
  --ngrithms-switch-on: #16a34a;
}`;

  protected readonly outlineSnippet = `:root {
  --ngrithms-btn-ghost-bg: transparent;
  --ngrithms-btn-ghost-fg: #1f2937;
  --ngrithms-btn-ghost-border: rgba(0, 0, 0, 0.16);
  --ngrithms-btn-ghost-bg-hover: rgba(0, 0, 0, 0.04);
  --ngrithms-btn-ghost-border-hover: rgba(0, 0, 0, 0.24);
  --ngrithms-btn-ghost-text-decoration-hover: none;
}`;

  protected readonly brandMakeoverCssSnippet = `:root {
  /* Banner — color, geometry, glow */
  --ngrithms-banner-bg: #ffffff;
  --ngrithms-banner-fg: #1e1b4b;
  --ngrithms-banner-fg-muted: rgba(30, 27, 75, 0.7);
  --ngrithms-banner-border: #e0e7ff;
  --ngrithms-banner-radius: 20px;
  --ngrithms-banner-padding: 24px 28px;
  --ngrithms-banner-shadow: 0 20px 50px rgba(79, 70, 229, 0.18);
  --ngrithms-banner-max-width: 760px;
  --ngrithms-link: #4f46e5;

  /* Buttons — pill shape, indigo brand. Only the "Settings" (ghost) button uses black text. */
  --ngrithms-btn-radius: 999px;
  --ngrithms-btn-padding: 10px 22px;
  --ngrithms-btn-primary-bg: #4f46e5;
  --ngrithms-btn-primary-fg: #ffffff;
  --ngrithms-btn-primary-bg-hover: #4338ca;
  --ngrithms-btn-secondary-fg: #4f46e5;
  --ngrithms-btn-secondary-border: #c7d2fe;
  --ngrithms-btn-secondary-bg-hover: rgba(79, 70, 229, 0.08);
  --ngrithms-btn-ghost-fg: #4f46e5;
  --ngrithms-btn-ghost-fg-hover: #1e1b4b;
  --ngrithms-btn-ghost-text-decoration-hover: none;

  /* Switches */
  --ngrithms-switch-on: #4f46e5;

  /* Badge — solid indigo with brand glow */
  --ngrithms-badge-bg: #4f46e5;
  --ngrithms-badge-fg: #ffffff;
  --ngrithms-badge-border: transparent;
  --ngrithms-badge-shadow: 0 8px 24px rgba(79, 70, 229, 0.35);
}`;

  protected readonly brandMakeoverLangSnippet = `// app.config.ts — register a brand override pack
provideCookieConsent({
  categories: [/* ... */],
  customLanguages: {
    'brand-en': {
      languageKey: 'brand-en',
      languageName: 'Brand (English)',
      fallback: 'en',                       // anything not listed falls back to English
      translations: {
        'banner.customize': 'Settings',     // rename the button
      },
    },
  },
});

// theming.component.ts — activate the brand copy at runtime
import { inject } from '@angular/core';
import { LanguageService } from '@ngrithms/cookie-consent';

const i18n = inject(LanguageService);
i18n.setLanguage('brand-en');               // and 'en' to revert`;

  protected apply(theme: Preset): void {
    this.active.set(theme);
    this.clearOverrides();
    const root = this.document.documentElement;
    for (const [property, value] of Object.entries(THEME_OVERRIDES[theme])) {
      root.style.setProperty(property, value);
    }
  }

  protected toggleOutlineCustomize(): void {
    const root = this.document.documentElement;
    const next = !this.outlineCustomize();
    this.outlineCustomize.set(next);
    if (next) {
      for (const [property, value] of Object.entries(OUTLINE_CUSTOMIZE_VARS)) {
        root.style.setProperty(property, value);
      }
    } else {
      for (const property of Object.keys(OUTLINE_CUSTOMIZE_VARS)) {
        root.style.removeProperty(property);
      }
    }
  }

  protected toggleBrandMakeover(): void {
    const root = this.document.documentElement;
    const next = !this.brandMakeover();
    this.brandMakeover.set(next);
    if (next) {
      this.previousLanguage = this.i18n.currentLanguage();
      this.i18n.setLanguage('brand-en');
      for (const [property, value] of Object.entries(BRAND_MAKEOVER_VARS)) {
        root.style.setProperty(property, value);
      }
    } else {
      this.i18n.setLanguage(this.previousLanguage);
      for (const property of Object.keys(BRAND_MAKEOVER_VARS)) {
        root.style.removeProperty(property);
      }
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
