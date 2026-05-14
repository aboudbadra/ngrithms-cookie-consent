# @ngrithms/cookie-consent

[![npm](https://img.shields.io/npm/v/@ngrithms/cookie-consent.svg)](https://www.npmjs.com/package/@ngrithms/cookie-consent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern Angular cookie consent — **standalone components**, **signal-based state**, **`provideCookieConsent()` functional setup**, **SSR-safe**, **zero runtime dependencies**.

> Built as a from-scratch replacement for the abandoned NgModule-era consent libraries. Designed for Angular 17 and up.

## Features

- ✅ Standalone components, no `NgModule`, no `forRoot()`
- ✅ Signal-based reactive consent state (with RxJS observable bridges)
- ✅ Two-level data model: **Category** (visual group) → **CookieItem** (toggle) → **CookieDetail** (informational)
- ✅ `*ngrIfConsent="'item-key'"` structural directive
- ✅ Preset category constants (`ANALYTICS_PRESET`, `MARKETING_PRESET`, ...) — spread them in or use as templates
- ✅ First-class Google Consent Mode v2 adapter
- ✅ Built-in i18n (`en`, `fr`) + custom-language API with icon path + fallback
- ✅ Optional CSS theme presets — or go headless and style it yourself
- ✅ SSR-safe out of the box
- ✅ Zero runtime dependencies

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
      defaultLanguage: 'en',
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

```scss
/* styles.scss — pick a theme, or skip this and theme it yourself */
@import '@ngrithms/cookie-consent/themes/default.css';
```

## Documentation

Full API reference and live examples: **[demo app](./projects/demo)**.

## Development

```bash
npm install
npm run build:lib       # ng build cookie-consent
npm run start:demo      # ng serve demo
```

## License

MIT © Aboud Badra
