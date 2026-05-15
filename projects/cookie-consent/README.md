# @ngrithms/cookie-consent

[![npm](https://img.shields.io/npm/v/@ngrithms/cookie-consent.svg)](https://www.npmjs.com/package/@ngrithms/cookie-consent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern Angular cookie consent — **standalone components**, **signal-based state**, **`provideCookieConsent()` functional setup**, **SSR-safe**, **zero runtime dependencies**.

> A from-scratch replacement for the abandoned NgModule-era consent libraries. Designed for Angular 17+ (peer range `>=17.2.0 <22.0.0`).

## Features

- Standalone components, no `NgModule`, no `forRoot()`
- Signal-based reactive consent state (with RxJS observable bridges)
- Two-level data model: **Category** (visual group) → **CookieItem** (toggle) → **CookieDetail** (informational)
- `*ngrIfConsent="'item-key'"` structural directive
- Preset category constants (`ANALYTICS_PRESET`, `MARKETING_PRESET`, …) — spread them in or use as templates
- First-class Google Consent Mode v2 adapter
- Built-in i18n (`en`, `fr`) + custom-language API with icon path + fallback
- Fully customizable copy via translation keys — no markup forks needed
- Optional CSS theme presets — or go headless and style it yourself
- SSR-safe out of the box
- Zero runtime dependencies

## Install

```bash
npm install @ngrithms/cookie-consent
```

## Quick start

Three files — matches what `ng new` scaffolds.

```ts
// src/app/app.config.ts — register the provider
import { ApplicationConfig } from '@angular/core';
import { provideCookieConsent, ANALYTICS_PRESET, MARKETING_PRESET } from '@ngrithms/cookie-consent';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCookieConsent({
      privacyPolicyUrl: '/privacy',
      categories: [ANALYTICS_PRESET, MARKETING_PRESET],
    }),
  ],
};
```

```ts
// src/app/app.component.ts — import the standalone components & directive
import { Component } from '@angular/core';
import { ConsentBannerComponent, ConsentBadgeComponent, IfConsentDirective } from '@ngrithms/cookie-consent';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ConsentBannerComponent, ConsentBadgeComponent, IfConsentDirective],
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

```html
<!-- src/app/app.component.html -->
<ngr-consent-banner></ngr-consent-banner>
<ngr-consent-badge></ngr-consent-badge>

<div *ngrIfConsent="'google_analytics'">
  <!-- Only rendered if the user consented to Google Analytics. -->
</div>
```

```css
/* src/styles.css — pick a theme, or skip this and theme it yourself */
@import '@ngrithms/cookie-consent/themes/default.css';
```

## How it works

The library is a thin state machine. It exposes a set of `CookieItem.key` strings (the toggles in the UI) and tracks which ones the user has granted. **It does not load any third-party SDKs or set any third-party cookies on its own** — the only cookie it writes is its own preferences cookie (`ngrithms_consent_*`).

Your job, as the consumer, is to wire each `CookieItem.key` to the actual side effect — loading `gtag.js`, mounting a YouTube `<iframe>`, calling Hotjar's init function, etc. The library gives you four patterns for that wiring:

| Pattern | Use it for | API |
|---|---|---|
| **Structural directive** | Iframes, embeds, components that should mount/unmount with consent | `*ngrIfConsent="'<key>'"` |
| **Script loader** | Third-party SDKs loaded via `<script>` tag (GA, Hotjar, Intercom, FB Pixel) | `ScriptLoaderService.load({ itemKey, src, ... })` |
| **Reactive state** | Imperative code in your own services | `ConsentService.isGranted('<key>')` signal / `item$('<key>')` observable |
| **Google Consent Mode v2** | GA4 / Google Ads (keep `gtag.js` loaded always, gate behavior via `gtag('consent', 'update', ...)`) | `applyGoogleConsentMode(consent, { mapping, defaults })` |

The `CookieItem.key` is the join column — it appears in your category config, in the UI as a toggle, and in every wiring pattern above. See [Integration patterns](#integration-patterns) below for working examples of each.

## Consent data model

```
Category   (visual group, e.g. "Analytics")
  └─ items: CookieItem[]   (toggleable — what *ngrIfConsent checks)
       └─ cookies: CookieDetail[]  (informational rows in the details view)
```

Each `CookieItem.key` is the value you pass to `*ngrIfConsent="'<key>'"` and to `ConsentService.isGranted(...)`. Keep keys stable across releases — if you need to rename one later, see [Migrating persisted state](#migrating-persisted-state-across-key-renames).

## Presets

Ship time-tested category shapes you can drop in or extend:

```ts
import { ANALYTICS_PRESET, MARKETING_PRESET, FUNCTIONAL_PRESET, SOCIAL_PRESET, ADVERTISING_PRESET } from '@ngrithms/cookie-consent';

provideCookieConsent({
  categories: [
    ANALYTICS_PRESET,                                 // drop in
    { ...MARKETING_PRESET, items: [...MARKETING_PRESET.items, myCustom] }, // extend
    { key: 'social', name: 'Embeds', items: [...] },  // fully custom
  ],
});
```

## Integration patterns

### Gating content with `*ngrIfConsent`

```html
<!-- Only render when consent for this CookieItem is granted -->
<div *ngrIfConsent="'google_analytics'">
  <iframe src="https://www.googletagmanager.com/..."></iframe>
</div>

<!-- Optional fallback template when consent is missing -->
<div *ngrIfConsent="'google_analytics'; else placeholder">
  <iframe src="..."></iframe>
</div>
<ng-template #placeholder>
  Enable analytics in <a href="#" (click)="consent.open()">cookie preferences</a> to see this content.
</ng-template>
```

When the user toggles consent off, the directive destroys the contained view — iframes are unmounted, components are torn down. The next toggle-on re-creates them.

### Deferring `<script>` tags with `ScriptLoaderService`

`ScriptLoaderService` injects a `<script>` element when consent for an item is granted, **removes it when consent is revoked**, and re-injects on re-grant. SSR-safe (no-op on the server).

> Removing the element does not undo side effects the script already had on `window`. Analytics SDKs that installed globals stay installed until page reload — for those, pair this with `applyGoogleConsentMode` (below) to gate runtime behavior on top of script presence.

```ts
import { inject } from '@angular/core';
import { ScriptLoaderService } from '@ngrithms/cookie-consent';

const loader = inject(ScriptLoaderService);

loader.load({
  itemKey: 'google_analytics',
  src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXX',
  attrs: { async: true },
  onLoad: () => {
    (window as any).dataLayer ??= [];
    (window as any).gtag = function () { (window as any).dataLayer.push(arguments); };
    (window as any).gtag('js', new Date());
    (window as any).gtag('config', 'G-XXXXX');
  },
});
```

| Option | Type | Notes |
|---|---|---|
| `itemKey` | `string` | `CookieItem.key` that must be granted before injection |
| `src` | `string` | External script URL |
| `inline` | `string` | Inline script body (used when `src` is omitted) |
| `attrs` | `Record<string, string \| boolean>` | `<script>` attributes; `true` sets the attribute with no value, `false` omits |
| `onLoad` | `() => void` | Fires once the external script reports `load` |

### Reading state in your own code

```ts
import { inject, effect } from '@angular/core';
import { ConsentService } from '@ngrithms/cookie-consent';

const consent = inject(ConsentService);

// Signal — re-runs effects when consent changes
const isGa = consent.isGranted('google_analytics');
effect(() => {
  if (isGa()) initHotjar();
});

// Observable — for RxJS pipelines. Callable from anywhere
// (no active injection context required).
consent.item$('google_analytics').subscribe(on => console.log('GA granted?', on));

// Imperative control
consent.acceptAll();
consent.denyAll();
consent.accept(['google_analytics']);   // accept a specific subset
consent.open();         // open banner
consent.openModal();    // open preferences modal
consent.reset();        // clear stored cookie + re-prompt
```

### Google Consent Mode v2

GA4 has its own consent protocol — you keep `gtag.js` loaded always, but call `gtag('consent', 'update', {...})` whenever the user changes settings. Use this *instead* of removing the GA script.

```ts
import { applyGoogleConsentMode, ConsentService } from '@ngrithms/cookie-consent';
import { inject } from '@angular/core';

const consent = inject(ConsentService);

applyGoogleConsentMode(consent, {
  mapping: {
    google_analytics: 'analytics_storage',
    google_ads: ['ad_storage', 'ad_user_data', 'ad_personalization'],
  },
  defaults: {
    analytics_storage: 'denied',
    ad_storage: 'denied',
  },
});
```

## Customizing text

Every visible string in the UI is overridable. There are two surfaces — *per-item* text (set inline on your categories) and *chrome* text (banner heading, button labels, etc., overridden via translation keys).

### Per-item and per-category labels

`Category.name`, `Category.description`, `CookieItem.name`, `CookieItem.description`, `CookieItem.privacyPolicyUrl`, `CookieDetail.purpose`, and `CookieDetail.duration` all accept `string | TranslatableString`:

```ts
provideCookieConsent({
  categories: [{
    key: 'analytics',
    name: 'Analytics',
    description: 'Helps us understand how visitors use the site.',
    items: [{
      key: 'google_analytics',
      name: 'Google Analytics',
      description: 'Anonymous traffic measurement.',
      privacyPolicyUrl: 'https://policies.google.com/privacy',
      cookies: [
        { name: '_ga', provider: 'Google', purpose: 'Distinguishes users', duration: '2 years' },
      ],
    }],
  }],
});
```

For multilingual sites use the `TranslatableString` shape — `{ en: 'Analytics', fr: 'Statistiques' }` — and it resolves against the active language.

### Banner, modal, and button copy

All chrome text is keyed by a translation string ID. Override the built-in `en` pack (or any other) to change the wording without forking the components:

| Key | What it controls |
|---|---|
| `banner.title` | Banner heading |
| `banner.description` | Banner body text |
| `banner.accept_all` | "Accept all" button |
| `banner.deny_all` | "Reject all" button |
| `banner.customize` | "Customize" / preferences button |
| `banner.save_preferences` | "Save preferences" button (inside modal) |
| `banner.show_details` | Per-item "Show details" toggle |
| `banner.hide_details` | Per-item "Hide details" toggle |
| `badge.open` | Floating re-open badge label / aria-label |
| `footer.privacy_policy` | Privacy policy link text |
| `footer.imprint` | Imprint link text |
| `modal.locked` | Tooltip on the always-on essential toggle |
| `modal.cookie.name` | "Name" column header in the details table |
| `modal.cookie.provider` | "Provider" column header |
| `modal.cookie.purpose` | "Purpose" column header |
| `modal.cookie.duration` | "Duration" column header |

Override pattern:

```ts
provideCookieConsent({
  categories: [...],
  customLanguages: {
    en: {
      languageKey: 'en',
      languageName: 'English',
      translations: {
        'banner.title': 'We use cookies on Acme',
        'banner.description': 'Pick what you want to allow. You can change this any time from the badge in the corner.',
        'banner.accept_all': 'Allow everything',
        'banner.deny_all': 'Reject',
        'banner.customize': 'Choose',
        'footer.privacy_policy': 'Our privacy policy',
      },
    },
  },
});
```

Only keys you specify are overridden — everything else falls back to the bundled `en` strings.

### Adding a language

```ts
provideCookieConsent({
  categories: [...],
  defaultLanguage: 'en',
  availableLanguages: ['en', 'sw'],
  customLanguages: {
    sw: {
      languageKey: 'sw',
      languageName: 'Kiswahili',
      iconPath: '/assets/flags/sw.svg',
      fallback: 'en',                      // missing keys fall back to English
      translations: {
        'banner.title': 'Tunatumia vidakuzi',
        'banner.accept_all': 'Kubali zote',
        // ...
      },
    },
  },
});
```

The language switcher appears automatically when `availableLanguages.length > 1` (override with `showLanguageSwitcher`).

### Per-language links

```ts
provideCookieConsent({
  // Single URL for every language:
  privacyPolicyUrl: '/privacy',

  // …or a per-language URL via TranslatableString:
  privacyPolicyUrl: { en: '/privacy', fr: '/fr/confidentialite' },

  // Same for imprintUrl:
  imprintUrl: { en: '/legal', fr: '/fr/mentions-legales' },
});
```

## Themes

Pick one and import in your global stylesheet:

```css
@import '@ngrithms/cookie-consent/themes/default.css';
@import '@ngrithms/cookie-consent/themes/dark.css';
@import '@ngrithms/cookie-consent/themes/minimal.css';
@import '@ngrithms/cookie-consent/themes/rounded.css';
```

Or override individual CSS custom properties yourself — every visual aspect is themable:

```css
:root {
  --ngrithms-btn-primary-bg: #4f46e5;
  --ngrithms-banner-radius: 16px;
  --ngrithms-switch-on: #16a34a;
}
```

For full headless control set `theme: 'none'` and style the semantic class names (`.ngr-consent-banner`, `.ngr-consent-modal__switch`, etc.) yourself.

## Configuration reference

| Option | Type | Default | Notes |
|---|---|---|---|
| `categories` | `Category[]` | _required_ | The consent categories shown in the UI |
| `essential` | `Partial<Category>` | implicit | Override label/items of the always-granted essential category |
| `privacyPolicyUrl` / `imprintUrl` | `string \| TranslatableString` | — | Linked in the footer |
| `defaultLanguage` | `string` | `'en'` | |
| `availableLanguages` | `string[]` | `['en']` | |
| `showLanguageSwitcher` | `boolean` | auto | True when >1 language |
| `customLanguages` | `Record<string, LanguagePack>` | `{}` | BYO translations with optional flag icon (see [Customizing text](#customizing-text)) |
| `position` | `ConsentPosition` | `'bottom-bar'` | bottom-bar, top-bar, corners, modal |
| `theme` | `'default'\|'dark'\|'minimal'\|'rounded'\|'none'` | `'default'` | `'none'` ships no CSS (headless mode) |
| `showBadgeOpener` | `boolean` | `true` | Floating re-open button |
| `badgePosition` | `BadgePosition` | `'left-bottom'` | |
| `cookiePrefix` | `string` | `'ngrithms_consent_'` | |
| `cookieExpiryDays` | `number` | `365` | |
| `showCookieDetails` | `boolean` | `true` | Show the per-cookie details table |
| `hideDeny` | `boolean` | `false` | Hide the "Reject all" button |
| `hideImprint` | `boolean` | `false` | Hide the imprint link |
| `customClass` / `customOpenerClass` | `string` | — | BYO styling hooks |
| `excludeRoutes` | `string[]` | `[]` | Routes on which the banner is suppressed |
| `version` | `number` | `1` | Bump to force re-prompt without changing storage shape |
| `schemaVersion` | `number` | `1` | Bump when you rename a `CookieItem.key` or change persisted-state semantics. Triggers `migrate` on read |
| `migrate` | `(stored: unknown) => ConsentState \| null` | — | Called when stored `schemaVersion` ≠ `config.schemaVersion`. Return migrated state or `null` to re-prompt |

## Migrating persisted state across key renames

`version` forces a re-prompt without touching the stored shape. `schemaVersion` is for when the *shape* changes — you renamed a `CookieItem.key`, restructured `granted`, or otherwise made old data ambiguous. Bump it and provide a `migrate` hook to translate forward instead of dropping users' decisions on the floor.

```ts
provideCookieConsent({
  categories: [...],
  schemaVersion: 2,
  migrate: (stored) => {
    const old = stored as {
      granted: Record<string, boolean>;
      timestamp: number;
      version: number;
    };
    // v1 used "ga"; v2 standardised on "google_analytics".
    const granted = { ...old.granted };
    granted['google_analytics'] = granted['ga'] === true;
    delete granted['ga'];
    return {
      granted,
      timestamp: old.timestamp,
      version: old.version,
      schemaVersion: 2,
    };
  },
});
```

Return `null` from `migrate` to discard the stored data and re-prompt the user. Stored cookies written before this library introduced `schemaVersion` (i.e. by 0.1.x) are treated as schema `1` automatically — no migration needed for that upgrade.

## SSR

All DOM access is guarded by `isPlatformBrowser`. The library works under `provideServerRendering()` and `@angular/ssr` without configuration. `ConsentService.item$()` is callable from any context — it captures an `Injector` internally and runs `toObservable` inside `runInInjectionContext`, so calling it from event handlers, lifecycle methods, or arbitrary service code does not require an active injection context.

## License

MIT © Aboud Badra