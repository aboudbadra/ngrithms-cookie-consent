# Changelog

All notable changes to `@ngrithms/cookie-consent` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] — 2026-05-14

### Fixed

- Import `DOCUMENT` from `@angular/common` instead of `@angular/core`. The `@angular/core` export only exists in Angular 19+, so 0.1.0 silently broke Angular 17/18 builds despite the declared peer range.

## [0.1.0] — 2026-05-14

### Added

- Initial release.
- Standalone `<ngr-consent-banner>`, `<ngr-consent-modal>`, `<ngr-consent-badge>` components.
- `provideCookieConsent({...})` functional setup — no `forRoot()`, no NgModule.
- Signal-based `ConsentService` with RxJS observable bridges.
- `*ngrIfConsent` structural directive keyed on `CookieItem.key`.
- Two-level user-defined consent model: `Category` → `CookieItem` → `CookieDetail`.
- Preset categories: `ANALYTICS_PRESET`, `MARKETING_PRESET`, `FUNCTIONAL_PRESET`, `SOCIAL_PRESET`, `ADVERTISING_PRESET`.
- Google Consent Mode v2 adapter.
- Built-in `en` + `fr` translations; `customLanguages` config for BYO with optional icon path and fallback.
- Optional CSS theme presets: `default`, `dark`, `minimal`, `rounded`. Headless mode via `theme: 'none'`.
- SSR-safe — no DOM access outside `isPlatformBrowser`.
- Angular 17+ peer compatibility (`>=17.0.0 <22.0.0`).
- Zero runtime dependencies.
