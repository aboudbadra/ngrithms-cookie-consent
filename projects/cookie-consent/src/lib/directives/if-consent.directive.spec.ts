import { describe, expect, it, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { IfConsentDirective } from './if-consent.directive';
import { ConsentService } from '../services/consent.service';
import { COOKIE_CONSENT_CONFIG } from '../tokens/config.token';
import { CookieConsentConfig } from '../types/config';
import { Category } from '../types/category';

const ANALYTICS: Category = {
  key: 'analytics',
  name: 'Analytics',
  items: [{ key: 'google_analytics', name: 'GA', description: '' }],
};

@Component({
  standalone: true,
  imports: [IfConsentDirective],
  template: `
    <div data-testid="gated" *ngrIfConsent="'google_analytics'; else placeholder">
      <span>gated content</span>
    </div>
    <ng-template #placeholder>
      <div data-testid="placeholder">opt in to see this</div>
    </ng-template>
  `,
})
class HostComponent {}

@Component({
  standalone: true,
  imports: [IfConsentDirective],
  template: `<div data-testid="gated" *ngrIfConsent="'google_analytics'">gated</div>`,
})
class HostNoElseComponent {}

function setup<T>(host: new () => T): ComponentFixture<T> {
  // Each test gets its own prefix so the jsdom document.cookie doesn't leak between tests.
  const prefix = `test_consent_${Math.random().toString(36).slice(2)}_`;
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: COOKIE_CONSENT_CONFIG,
        useValue: {
          categories: [ANALYTICS],
          cookiePrefix: prefix,
          cookieExpiryDays: 365,
          version: 1,
        } as CookieConsentConfig,
      },
    ],
  });
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  return fixture;
}

function html(f: ComponentFixture<unknown>): string {
  return (f.nativeElement as HTMLElement).innerHTML;
}

describe('IfConsentDirective', () => {
  describe('with else template', () => {
    let fixture: ComponentFixture<HostComponent>;
    let consent: ConsentService;

    beforeEach(() => {
      fixture = setup(HostComponent);
      consent = TestBed.inject(ConsentService);
    });

    it('renders placeholder when consent is not granted', () => {
      expect(html(fixture)).toContain('opt in to see this');
      expect(html(fixture)).not.toContain('gated content');
    });

    it('renders gated content after acceptAll', async () => {
      consent.acceptAll();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(html(fixture)).toContain('gated content');
      expect(html(fixture)).not.toContain('opt in to see this');
    });

    it('swaps back to placeholder when consent is revoked via reset', async () => {
      consent.acceptAll();
      await fixture.whenStable();
      fixture.detectChanges();
      consent.reset();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(html(fixture)).toContain('opt in to see this');
      expect(html(fixture)).not.toContain('gated content');
    });

    it('hides gated content after denyAll', async () => {
      consent.denyAll();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(html(fixture)).toContain('opt in to see this');
      expect(html(fixture)).not.toContain('gated content');
    });
  });

  describe('without else template', () => {
    it('renders nothing when consent is not granted', () => {
      const fixture = setup(HostNoElseComponent);
      expect(html(fixture)).not.toContain('gated');
    });

    it('renders the template once consent is granted', async () => {
      const fixture = setup(HostNoElseComponent);
      const consent = TestBed.inject(ConsentService);
      consent.acceptAll();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(html(fixture)).toContain('gated');
    });
  });
});
