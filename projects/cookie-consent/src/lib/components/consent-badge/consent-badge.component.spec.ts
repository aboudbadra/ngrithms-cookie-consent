import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ConsentBadgeComponent } from './consent-badge.component';
import { ConsentService } from '../../services/consent.service';
import { COOKIE_CONSENT_CONFIG } from '../../tokens/config.token';
import { CookieConsentConfig } from '../../types/config';
import { Category } from '../../types/category';

const ANALYTICS: Category = {
  key: 'analytics',
  name: 'Analytics',
  items: [{ key: 'google_analytics', name: 'GA', description: '' }],
};

function setup(overrides: Partial<CookieConsentConfig> = {}): {
  fixture: ComponentFixture<ConsentBadgeComponent>;
  consent: ConsentService;
} {
  const prefix = `test_badge_${Math.random().toString(36).slice(2)}_`;
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
          showBadgeOpener: true,
          badgePosition: 'left-bottom',
          ...overrides,
        } as CookieConsentConfig,
      },
    ],
  });
  const fixture = TestBed.createComponent(ConsentBadgeComponent);
  const consent = TestBed.inject(ConsentService);
  fixture.detectChanges();
  return { fixture, consent };
}

function badge(fixture: ComponentFixture<unknown>): HTMLButtonElement | null {
  return fixture.nativeElement.querySelector('button.ngr-consent-badge');
}

describe('ConsentBadgeComponent', () => {
  it('is hidden before the user has decided (banner is still up)', () => {
    const { fixture } = setup();
    expect(badge(fixture)).toBeNull();
  });

  it('appears once a decision has been made and banner is closed', async () => {
    const { fixture, consent } = setup();
    consent.acceptAll();
    await fixture.whenStable();
    fixture.detectChanges();
    const btn = badge(fixture);
    expect(btn).not.toBeNull();
    expect(btn!.getAttribute('data-position')).toBe('left-bottom');
    expect(btn!.getAttribute('aria-label')).toBeTruthy();
  });

  it('clicking the badge re-opens the banner', async () => {
    const { fixture, consent } = setup();
    consent.acceptAll();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(consent.bannerVisible()).toBe(false);
    badge(fixture)!.click();
    expect(consent.bannerVisible()).toBe(true);
  });

  it('hides again when the banner is shown', async () => {
    const { fixture, consent } = setup();
    consent.acceptAll();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(badge(fixture)).not.toBeNull();
    consent.open();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(badge(fixture)).toBeNull();
  });

  it('stays hidden when showBadgeOpener=false, even after a decision', async () => {
    const { fixture, consent } = setup({ showBadgeOpener: false });
    consent.acceptAll();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(badge(fixture)).toBeNull();
  });

  it('honors badgePosition via data-position attribute', async () => {
    const { fixture, consent } = setup({ badgePosition: 'right-top' });
    consent.acceptAll();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(badge(fixture)!.getAttribute('data-position')).toBe('right-top');
  });

  it('renders the detailed cookie SVG inside the badge', async () => {
    const { fixture, consent } = setup();
    consent.acceptAll();
    await fixture.whenStable();
    fixture.detectChanges();
    const svg = badge(fixture)!.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('viewBox')).toBe('0 0 120.23 122.88');
    const path = svg!.querySelector('path');
    expect(path).not.toBeNull();
    expect(path!.getAttribute('fill-rule')).toBe('evenodd');
    expect(path!.getAttribute('fill')).toContain('--ngrithms-badge-icon-fill');
  });
});
