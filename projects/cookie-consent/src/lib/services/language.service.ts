import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { COOKIE_CONSENT_CONFIG } from '../tokens/config.token';
import { BUILTIN_LANGUAGES } from '../languages';
import { LanguagePack } from '../types/language-pack';
import { TranslatableString } from '../types/translatable-string';

/**
 * Signal-based i18n. Resolves translation keys against the active language with fallback
 * (per-pack `fallback` → `defaultLanguage` → English). Also resolves `TranslatableString`
 * values that appear inside the config.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly config = inject(COOKIE_CONSENT_CONFIG);

  /** All language packs merged: built-ins overridden by user-supplied `customLanguages`. */
  private readonly packs: Record<string, LanguagePack> = {
    ...BUILTIN_LANGUAGES,
    ...(this.config.customLanguages ?? {}),
  };

  private readonly active = signal<string>(this.initialLanguage());

  /** Currently active language code, e.g. `'en'`. */
  readonly currentLanguage: Signal<string> = this.active.asReadonly();

  /** Reactive stream of the active language for RxJS consumers. */
  readonly currentLanguage$: Observable<string> = toObservable(this.active);

  /** All available language codes, in display order (matches `config.availableLanguages`). */
  readonly availableLanguages: Signal<string[]> = computed(() => {
    const configured = this.config.availableLanguages ?? ['en'];
    return configured.filter((code) => this.packs[code] !== undefined);
  });

  /** Switch the active language. No-op if the code isn't known. */
  setLanguage(code: string): void {
    if (this.packs[code]) {
      this.active.set(code);
    }
  }

  /** Look up the metadata for a language code (name, icon path, etc.). */
  getPack(code: string): LanguagePack | undefined {
    return this.packs[code];
  }

  /**
   * Translate a key. Falls back per-pack `fallback` → `defaultLanguage` → `'en'` → the key
   * itself if nothing matches.
   */
  translate(key: string): Signal<string> {
    return computed(() => this.resolveKey(key, this.active()));
  }

  /** Eager (non-signal) version of `translate()` — for use outside of reactive contexts. */
  translateNow(key: string): string {
    return this.resolveKey(key, this.active());
  }

  /**
   * Resolve a `string | TranslatableString` config value against the active language.
   * Plain strings pass through; `TranslatableString` objects are looked up.
   */
  resolve(value: string | TranslatableString | undefined): Signal<string> {
    return computed(() => this.resolveValue(value, this.active()));
  }

  /** Eager version of `resolve()`. */
  resolveNow(value: string | TranslatableString | undefined): string {
    return this.resolveValue(value, this.active());
  }

  private resolveKey(key: string, language: string): string {
    const chain = this.fallbackChain(language);
    for (const code of chain) {
      const value = this.packs[code]?.translations?.[key];
      if (value !== undefined) return value;
    }
    return key;
  }

  private resolveValue(value: string | TranslatableString | undefined, language: string): string {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    const chain = this.fallbackChain(language);
    for (const code of chain) {
      if (value[code] !== undefined) return value[code];
    }
    // Last resort: first value in the object.
    const first = Object.values(value)[0];
    return first ?? '';
  }

  private fallbackChain(language: string): string[] {
    const chain: string[] = [language];
    const pack = this.packs[language];
    if (pack?.fallback && !chain.includes(pack.fallback)) {
      chain.push(pack.fallback);
    }
    const def = this.config.defaultLanguage ?? 'en';
    if (!chain.includes(def)) chain.push(def);
    if (!chain.includes('en')) chain.push('en');
    return chain;
  }

  private initialLanguage(): string {
    const configured = this.config.defaultLanguage ?? 'en';
    return this.packs[configured] ? configured : 'en';
  }
}
