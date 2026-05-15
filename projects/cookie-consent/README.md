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
- Optional CSS theme presets — or go headless and style it yourself
- SSR-safe out of the box
- Zero runtime dependencies

## Install

```bash
npm install @ngrithms/cookie-consent
```

## Quick start

```ts
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideCookieConsent, ANALYTICS_PRESET, MARKETING_PRESET } from '@ngrithms/cookie-consent';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [
    provideCookieConsent({
      privacyPolicyUrl: '/privacy',
      categories: [ANALYTICS_PRESET, MARKETING_PRESET],
    }),
  ],
});
```

```html
<!-- app.html -->
<ngr-consent-banner></ngr-consent-banner>
<ngr-consent-badge></ngr-consent-badge>

<div *ngrIfConsent="'google_analytics'">
  <!-- Only rendered if the user consented to Google Analytics. -->
</div>
```

```css
/* styles.css — pick a theme, or skip this and theme it yourself */
@import '@ngrithms/cookie-consent/themes/default.css';
```

## Configuration

| Option | Type | Default | Notes |
|---|---|---|---|
| `categories` | `Category[]` | _required_ | The consent categories shown in the UI |
| `essential` | `Partial<Category>` | implicit | Override label/items of the always-granted essential category |
| `privacyPolicyUrl` / `imprintUrl` | `string \| TranslatableString` | — | Linked in the footer |
| `defaultLanguage` | `string` | `'en'` | |
| `availableLanguages` | `string[]` | `['en']` | |
| `showLanguageSwitcher` | `boolean` | auto | True when >1 language |
| `customLanguages` | `Record<string, LanguagePack>` | `{}` | BYO translations with optional flag icon |
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

## Consent data model

```
Category   (visual group, e.g. "Analytics")
  └─ items: CookieItem[]   (toggleable — what *ngrIfConsent checks)
       └─ cookies: CookieDetail[]  (informational rows in the details view)
```

Each `CookieItem.key` is the value you pass to `*ngrIfConsent="'<key>'"` and to `ConsentService.isGranted(...)`.

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

## Gating content with `*ngrIfConsent`

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

## Deferring `<script>` tags until consent

`ScriptLoaderService` injects a `<script>` element when consent for an item is granted, **removes it when consent is revoked**, and re-injects on re-grant. It is SSR-safe (no-op on the server).

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

## Google Consent Mode v2

```ts
import { applyGoogleConsentMode } from '@ngrithms/cookie-consent';
import { inject, EnvironmentInjector } from '@angular/core';
import { ConsentService } from '@ngrithms/cookie-consent';

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

## Reactive API

```ts
const consent = inject(ConsentService);

// Signal
const isGa = consent.isGranted('google_analytics');
effect(() => console.log('GA granted?', isGa()));

// Observable
consent.item$('google_analytics').subscribe((on) => console.log('GA granted?', on));

// Imperative
consent.acceptAll();
consent.denyAll();
consent.accept(['google_analytics']);
consent.open();
consent.openModal();
consent.reset();
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
