import { describe, expect, it } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ConsentModalComponent } from './consent-modal.component';
import { ConsentService } from '../../services/consent.service';
import { COOKIE_CONSENT_CONFIG } from '../../tokens/config.token';
import { CookieConsentConfig } from '../../types/config';
import { Category } from '../../types/category';

const ANALYTICS: Category = {
  key: 'analytics',
  name: 'Analytics',
  items: [
    {
      key: 'google_analytics',
      name: 'GA',
      description: 'Tracks visits.',
      cookies: [
        { name: '_ga', provider: 'Google', purpose: 'IDs users', duration: '2y' },
      ],
    },
    { key: 'hotjar', name: 'Hotjar', description: '' },
  ],
};

function setup(overrides: Partial<CookieConsentConfig> = {}): {
  fixture: ComponentFixture<ConsentModalComponent>;
  consent: ConsentService;
} {
  const prefix = `test_modal_${Math.random().toString(36).slice(2)}_`;
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
          defaultLanguage: 'en',
          availableLanguages: ['en'],
          hideDeny: false,
          showCookieDetails: true,
          ...overrides,
        } as CookieConsentConfig,
      },
    ],
  });
  const fixture = TestBed.createComponent(ConsentModalComponent);
  const consent = TestBed.inject(ConsentService);
  fixture.detectChanges();
  return { fixture, consent };
}

function root(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function modalRoot(fixture: ComponentFixture<unknown>): HTMLElement | null {
  return root(fixture).querySelector('.ngr-consent-modal');
}

async function openModal(
  fixture: ComponentFixture<unknown>,
  consent: ConsentService,
): Promise<void> {
  consent.openModal();
  await fixture.whenStable();
  fixture.detectChanges();
}

function buttonByText(
  fixture: ComponentFixture<unknown>,
  text: string,
): HTMLButtonElement | null {
  const buttons = Array.from(root(fixture).querySelectorAll('button')) as HTMLButtonElement[];
  return buttons.find((b) => b.textContent?.trim() === text) ?? null;
}

function checkboxFor(
  fixture: ComponentFixture<unknown>,
  itemLabel: string,
): HTMLInputElement | null {
  const items = Array.from(root(fixture).querySelectorAll('.ngr-consent-modal__item')) as HTMLElement[];
  const item = items.find((el) => el.textContent?.includes(itemLabel));
  return item?.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
}

describe('ConsentModalComponent', () => {
  it('is hidden by default', () => {
    const { fixture } = setup();
    expect(modalRoot(fixture)).toBeNull();
  });

  it('renders when modalVisible() becomes true', async () => {
    const { fixture, consent } = setup();
    await openModal(fixture, consent);
    expect(modalRoot(fixture)).not.toBeNull();
  });

  it('exposes role=dialog and aria-modal=true', async () => {
    const { fixture, consent } = setup();
    await openModal(fixture, consent);
    const r = modalRoot(fixture)!;
    expect(r.getAttribute('role')).toBe('dialog');
    expect(r.getAttribute('aria-modal')).toBe('true');
    expect(r.getAttribute('aria-label')).toBeTruthy();
  });

  it('shows "Always active" instead of a toggle for essential items', async () => {
    const { fixture, consent } = setup();
    await openModal(fixture, consent);
    const items = Array.from(root(fixture).querySelectorAll('.ngr-consent-modal__item')) as HTMLElement[];
    const essential = items.find((el) => el.textContent?.includes('Session'));
    expect(essential).toBeTruthy();
    expect(essential!.textContent).toContain('Always active');
    expect(essential!.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it('toggles a non-essential item and commits it via "Save preferences"', async () => {
    const { fixture, consent } = setup();
    await openModal(fixture, consent);
    const checkbox = checkboxFor(fixture, 'GA')!;
    expect(checkbox.checked).toBe(false);
    checkbox.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(checkbox.checked).toBe(true);

    buttonByText(fixture, 'Save preferences')!.click();
    expect(consent.isGranted('google_analytics')()).toBe(true);
    expect(consent.isGranted('hotjar')()).toBe(false);
    expect(consent.modalVisible()).toBe(false);
  });

  it('"Accept all" from the modal grants every non-essential item', async () => {
    const { fixture, consent } = setup();
    await openModal(fixture, consent);
    buttonByText(fixture, 'Accept all')!.click();
    expect(consent.isGranted('google_analytics')()).toBe(true);
    expect(consent.isGranted('hotjar')()).toBe(true);
  });

  it('"Reject all" denies every non-essential item', async () => {
    const { fixture, consent } = setup();
    await openModal(fixture, consent);
    buttonByText(fixture, 'Reject all')!.click();
    expect(consent.isGranted('google_analytics')()).toBe(false);
    expect(consent.isGranted('hotjar')()).toBe(false);
    expect(consent.hasDecided()).toBe(true);
  });

  it('the close (X) button hides the modal without saving', async () => {
    const { fixture, consent } = setup();
    await openModal(fixture, consent);
    const checkbox = checkboxFor(fixture, 'GA')!;
    checkbox.click();
    (root(fixture).querySelector('.ngr-consent-modal__close') as HTMLButtonElement).click();
    expect(consent.modalVisible()).toBe(false);
    expect(consent.hasDecided()).toBe(false);
  });

  it('clicking the backdrop closes the modal', async () => {
    const { fixture, consent } = setup();
    await openModal(fixture, consent);
    (root(fixture).querySelector('.ngr-consent-modal__backdrop') as HTMLElement).click();
    expect(consent.modalVisible()).toBe(false);
  });

  it('hideDeny removes the "Reject all" button', async () => {
    const { fixture, consent } = setup({ hideDeny: true });
    await openModal(fixture, consent);
    expect(buttonByText(fixture, 'Reject all')).toBeNull();
    expect(buttonByText(fixture, 'Accept all')).not.toBeNull();
  });

  it('renders the cookie-details table only after the details toggle is clicked', async () => {
    const { fixture, consent } = setup();
    await openModal(fixture, consent);
    expect(root(fixture).querySelector('.ngr-consent-modal__cookies')).toBeNull();
    buttonByText(fixture, 'Show details')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    const table = root(fixture).querySelector('.ngr-consent-modal__cookies');
    expect(table).not.toBeNull();
    expect(table!.textContent).toContain('_ga');
    expect(table!.textContent).toContain('Google');
  });

  it('hydrates the draft from persisted state when re-opened', async () => {
    const { fixture, consent } = setup();
    consent.accept(['google_analytics']);
    await fixture.whenStable();
    fixture.detectChanges();
    await openModal(fixture, consent);
    expect(checkboxFor(fixture, 'GA')!.checked).toBe(true);
    expect(checkboxFor(fixture, 'Hotjar')!.checked).toBe(false);
  });
});
