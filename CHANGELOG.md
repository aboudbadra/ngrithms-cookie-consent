# Changelog

All notable changes to `@ngxt/cookie-consent` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial v0.1.0 release.
- Standalone `<ngxt-consent-banner>`, `<ngxt-consent-modal>`, `<ngxt-consent-badge>` components.
- `provideCookieConsent({...})` functional setup — no `forRoot()`, no NgModule.
- Signal-based `ConsentService` with RxJS observable bridges.
- `*ngxIfConsent` structural directive keyed on `CookieItem.key`.
- Two-level user-defined consent model: `Category` → `CookieItem` → `CookieDetail`.
- Preset categories: `ANALYTICS_PRESET`, `MARKETING_PRESET`, `FUNCTIONAL_PRESET`, `SOCIAL_PRESET`, `ADVERTISING_PRESET`.
- Google Consent Mode v2 adapter.
- Built-in `en` + `fr` translations; `customLanguages` config for BYO with optional icon path and fallback.
- Optional CSS theme presets: `default`, `dark`, `minimal`, `rounded`. Headless mode via `theme: 'none'`.
- SSR-safe — no DOM access outside `isPlatformBrowser`.
- Angular 17+ peer compatibility (`>=17.0.0 <22.0.0`).
- Zero runtime dependencies.
