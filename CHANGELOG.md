# Changelog

All notable changes to `@ngrithms/cookie-consent` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] — 2026-05-15

### Added

- **Persisted-state schema versioning.** New `config.schemaVersion` (default `1`) is stamped onto every cookie write. New `config.migrate(stored)` hook is called when stored `schemaVersion` doesn't match `config.schemaVersion` — return a `ConsentState` to adopt the migrated data, or `null` to discard and re-prompt. Distinct from `config.version`, which forces a re-prompt without changing the storage shape. Backward-compatible: cookies written by 0.1.x and 0.2.x (no `schemaVersion`) are treated as schema `1`.
- Significantly expanded library README — added sections for `*ngrIfConsent` (with `else` template), `ScriptLoaderService` (config table + caveat about persisted `window` side effects), Google Consent Mode v2 recipe, and a `schemaVersion` migration walkthrough. Workspace README now points at the lib README as the canonical API surface, plus a repository-layout / development / release section.
- 8 new tests for schema-version pathways (write stamps version, accept legacy 0.1.x cookies, discard on mismatch without migrate, run migrate + adopt result, discard when migrate returns null, prompt-version still enforced after migrate, malformed non-object data is safely rejected).

## [0.2.0] — 2026-05-15

### Added

- Initial test suite (109 unit tests / 10 spec files) covering adapters, services, the `*ngrIfConsent` directive, `provideCookieConsent` config merging, and all three UI components. Test step wired into CI.

### Changed

- **`ScriptLoaderService` now removes the injected `<script>` element when consent is revoked**, and re-injects on re-grant. Previously the script tag stayed in the DOM after a revoke and a page reload was required to honour it. Note that removing the element does not undo side effects the script has already had on `window` — analytics SDKs that installed globals stay installed until reload.

### Fixed

- `ConsentService.item$()` now captures an `Injector` and wraps `toObservable` in `runInInjectionContext`. It can be called from anywhere — not just constructors or field initializers. Fixes `NG0203` when `ScriptLoaderService.load()` (or other consumers) call `item$()` from a component method or event handler.

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
