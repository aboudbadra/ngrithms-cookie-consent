# Changelog

All notable changes to `@ngrithms/cookie-consent` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] — 2026-05-17

Accessibility pass — the work blocking a 1.0 cut. Keyboard and screen-reader users can now actually use the modal end-to-end, and the banner stops misrepresenting itself as a modal dialog. No public API surface changed; existing apps upgrade without code edits.

### Accessibility

- **Banner is now `role="region"` with `aria-labelledby` pointing at its title heading.** Previously it shipped as `role="dialog" aria-modal="false"`, which is an invalid combination and misleads assistive tech into treating a persistent landmark as a focus-trapping modal. The banner is a non-modal cookie-preferences landmark — region is the correct mapping.
- **Modal focus management.** Opening the modal captures the triggering element, then moves focus to the first focusable inside the dialog. Closing returns focus to the trigger (or falls back to the Customize button / floating badge if the trigger has been removed from the DOM). No more cursor stranded at the top of the page after dismissing the modal.
- **Focus trap.** Tab and Shift+Tab now wrap within the dialog instead of escaping into background content. The trap manages **every** Tab press manually (not just the first/last) so the modal's tab order is identical across browsers — Safari with macOS "Keyboard navigation" off otherwise skips buttons/links from native Tab navigation entirely.
- **Escape closes the modal.** Standard expected behaviour for modal dialogs; previously the only ways out were the X, the backdrop, and the footer buttons.
- **Background `inert` while modal is open.** All sibling children of `<body>` that don't contain the dialog get the `inert` attribute, which removes them from the accessibility tree, the focus order, and pointer events. Cleared on close. Combined with the focus trap, screen-reader virtual-cursor navigation no longer wanders into hidden background content.
- **Modal uses `aria-labelledby` + `aria-describedby`** pointing at the dialog's heading and description (was `aria-label` only). Keeps the announced name and the visible heading in sync and lets screen readers read the description on dialog focus.
- **Essential items now render a disabled, checked checkbox** instead of a plain "Always active" text span. Screen readers announce them as "checked, disabled" — conveying both the immutable state and the affirmative status — rather than reading a label that gives no semantic information about the underlying setting. The "Always active" text is preserved as adjacent visual context.
- **Details-toggle button exposes `aria-expanded` and `aria-controls`.** The cookie-details table gets a deterministic id matching the toggle's `aria-controls`, so screen-reader users know the toggle controls a collapsible region and what its current state is.
- **Cookie-details table `<th>` cells carry `scope="col"`.** Screen readers can now correctly associate each row's cells with the column header on row-by-row navigation.
- **Per-item toggle inputs link to their description text via `aria-describedby`.** Focusing a toggle now announces the item's description text alongside its label — useful when the item name alone (e.g. "GA") is not self-explanatory.
- **Language switcher `<select>` carries `aria-label` directly.** Previously the select was wrapped in an empty `<label>` with `aria-label` on the label, which is a pattern most screen readers do not recover gracefully from.
- **Banner focus management on re-open.** When the banner is shown via the floating badge (or any host-app trigger like a "Show preferences" link), focus moves to the *Customise* button instead of being lost to `<body>`. Previously, clicking the badge required the user to Tab through the entire page to reach the banner. On true close (after Accept/Reject), focus is restored to the original trigger if it still exists, otherwise to the re-rendered badge. Only fires when the banner is opened by an interactive element — initial-page-load appearance does **not** steal focus from whatever the user was doing.
- **Badge force-focuses itself before opening.** Safari with macOS "Keyboard navigation" off doesn't focus buttons on click; without this, the banner's "was this triggered by a real element?" check would fail and focus management would skip. The badge now explicitly calls `.focus()` on itself before invoking `consent.open()`.
- **Visible focus rings on every focusable surface** — banner buttons, banner footer links, language `<select>`, badge, modal close, modal toggle switches, details toggles, and modal footer buttons. All themeable via the new `--ngrithms-focus-ring` CSS custom property (default `#2563eb`). Banner/badge use `:focus-visible` (mouse clicks don't show a ring); modal-internal elements use plain `:focus` so the ring stays visible through programmatic Tab-trap focus moves — Safari does not flip the `:focus-visible` state for programmatic `.focus()` calls. Previously the lib relied on browser-default focus rings, which Safari (especially with macOS "Keyboard navigation" off) does not paint reliably on `<button>` elements.
- **Modal effect no longer steals focus on page load.** Angular `effect()` fires once on subscribe regardless of signal-value change; the close-side branch was running on the initial `visible() === false` pass, hitting the fallback selector, and pulling focus onto the floating badge before the user had touched anything. Guarded by an internal `hasBeenVisible` flag — close-side logic only runs after the modal has been opened at least once in the session.

### Known limitations

- **Safari + macOS "Keyboard navigation" off**: Tab cycles only through form fields (selects, inputs, textareas) — buttons and links are skipped entirely. This is a UA-level user preference that affects every site on the web, not a library bug. Inside the modal we work around it by managing Tab manually (focus trap), but the banner is a non-modal landmark and per WCAG must not trap focus. Safari users who navigate via keyboard will typically have *System Settings → Keyboard → Keyboard navigation* enabled; VoiceOver users are unaffected (VO has its own navigation independent of this setting).

### Tests

- 130 passing (up from 120). New: banner `role=region` + `aria-labelledby`; language switcher `aria-label`; banner re-open moves focus to Customise; banner does not steal focus on initial page load; modal Escape-closes; focus moves into dialog on open; focus returns to trigger on close; sibling `inert` applied on open and cleared on close; essential items expose a disabled checked checkbox; details toggle exposes aria-expanded/controls; th carries scope=col; toggles linked to description via aria-describedby; modal does not steal focus to fallback on initial render before first open.

### Deferred (planned for v0.5.1 polish)

- Body scroll lock while modal is open.
- Focus-management config knob for apps that want to suppress the trap (e.g. testing harnesses).
- Optional `bannerMode: 'modal'` config that makes the banner a real focus-trapping dialog for apps that want GDPR-style "user must decide before doing anything" behaviour — also resolves the Safari + kbd-nav-off banner Tab-cycle limitation for those apps.

## [0.4.0] — 2026-05-15

### Added

- **8 new CSS custom properties for the "Customize" (ghost) button** — `--ngrithms-btn-ghost-bg`, `--ngrithms-btn-ghost-border`, `--ngrithms-btn-ghost-bg-hover`, `--ngrithms-btn-ghost-border-hover`, `--ngrithms-btn-ghost-padding-inline`, `--ngrithms-btn-ghost-text-decoration-hover`. All defaults match the prior hardcoded values (transparent bg/border, underline-on-hover), so existing apps see no visual change. Set these to give the "Customize" button a border that matches "Reject all" — see the new README recipe.
- **New `--ngrithms-badge-icon-fill` CSS custom property** for fine-grained control over the floating badge's icon color, separate from the badge's text color (`--ngrithms-badge-fg`). Defaults to `currentColor`.
- **New "Recipes" section in the lib README** with worked examples for the three most-asked customizations: hiding the "Reject all" button (with a GDPR caveat), styling "Customize" as an outline button, and driving the banner's language from the host app's own switcher via `LanguageService.setLanguage()`.

### Fixed

- **Banner language switcher now reflects the active language when changed programmatically.** Previously the `<select>` used Angular's `[value]="currentLanguage()"` binding which is unreliable on `<select>` elements without `FormsModule` — if the value was set before `<option>` elements rendered, the browser silently fell back to the first option. Symptom: after calling `LanguageService.setLanguage('fr')`, the dropdown still showed the first language as selected while the rest of the banner correctly updated to French. Fixed by moving the binding to `[selected]="code === currentLanguage()"` on each `<option>`. Affects anyone using `setLanguage()` from outside the banner (e.g. driving the language from a host-app switcher per the README recipe).

### Changed

- **Floating consent badge now uses a properly-rendered detailed cookie icon.** The previous icon had the chocolate-chip dots encoded in the SVG path but rendered them as a solid filled blob (no `fill-rule="evenodd"`), so at the badge's 20px size it looked like a generic dark circle. The new icon — a cookie with a bite mark and clearly-visible chocolate chips — renders correctly. Existing apps will see the floating opener look subtly different (better) after upgrading.

### Demo

- Refreshed the demo's **Home page Quick start** to match the v0.3.1 README pattern (4 code blocks: `app.config.ts`, `app.component.ts`, `app.component.html`, `styles.css`) — the previous quick start showed the deprecated inline-`bootstrapApplication` pattern that doesn't match what `ng new` scaffolds on Angular 17+. Home page also gains a "How it works" section listing the four wiring patterns.
- Refreshed the **Theming page** with a new "CSS variables reference" section (grouped tables for banner / buttons / badge / switches, including the 8 new ghost-button vars and the new `--ngrithms-badge-icon-fill`) and a new "Recipe: outline-style Customize button" with a live toggle that flips the new ghost-button vars on the real banner so you can see the effect immediately.

## [0.3.1] — 2026-05-15

### Documentation

- Restructured the library README around a four-pattern integration model (structural directive, script loader, reactive state, Google Consent Mode v2) — makes it explicit that the library only tracks consent state and the consumer is responsible for the actual side effects (loading SDKs, mounting iframes, gating in-app code) via shared `CookieItem.key`s.
- New "How it works" section up top with the four-pattern overview table.
- New "Customizing text" section documenting all 16 overridable translation keys (`banner.title`, `banner.accept_all`, `banner.deny_all`, `banner.customize`, `banner.save_preferences`, `banner.show_details`, `banner.hide_details`, `badge.open`, `footer.privacy_policy`, `footer.imprint`, `modal.locked`, `modal.cookie.{name,provider,purpose,duration}`, `banner.description`) — previously undocumented and only discoverable by grepping the bundle. Includes worked examples for overriding the built-in `en` pack, adding a new language with fallback, and per-language URLs via `TranslatableString`.
- Fixed the **Quick start** to match the modern Angular CLI scaffold (`ng new` on Angular 17+): config now lives in `app.config.ts` via `ApplicationConfig` rather than inlined into `bootstrapApplication` in `main.ts`. Also added the previously-missing `app.component.ts` snippet showing that `ConsentBannerComponent`, `ConsentBadgeComponent`, and `IfConsentDirective` must be added to the host component's `imports: []` for the elements and `*ngrIfConsent` to resolve — copy-pasting the old quick start produced "is not a known element" / "Can't bind to 'ngrIfConsent'" errors in fresh projects.
- Reordered sections so the configuration reference table moves to the bottom (as a lookup) and the integration patterns + customization sections sit above it (as the discovery path).
- No code changes.

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
