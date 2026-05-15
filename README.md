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

Full API reference, configuration options, recipes (Google Consent Mode v2, custom themes, headless mode, SSR, schema migration), and details on `ScriptLoaderService` / `*ngrIfConsent` / the reactive `ConsentService` API live in the published library README:

- **[Library README](./projects/cookie-consent/README.md)** — the canonical API surface (also shipped to npm)
- **[Demo app](./projects/demo)** — runnable showcase: `npm run start:demo`
- **[Changelog](./CHANGELOG.md)**

## Repository layout

```
projects/
  cookie-consent/   # the published library (@ngrithms/cookie-consent)
  demo/             # consumer app used as a live showcase
```

## Development

```bash
npm install
npm test                # vitest, 117 unit specs, ~3s
npm run build:lib       # ng build cookie-consent → dist/cookie-consent
npm run start:demo      # ng serve demo
```

`npm test` runs the library suite (vitest under jsdom via `@angular/build:unit-test`). CI also runs `npm test` on every push and pull request.

## Releasing

1. Update `CHANGELOG.md` — move `[Unreleased]` to the new version + date.
2. `npm run release:patch | release:minor | release:major` — bumps `projects/cookie-consent/package.json` **and** the workspace `package.json`. No git tag or publish is created.
3. `npm run build:lib`
4. `cd dist/cookie-consent && npm publish --access public`
5. Commit, tag `vX.Y.Z`, push branch + tag.

## License

MIT © Aboud Badra
