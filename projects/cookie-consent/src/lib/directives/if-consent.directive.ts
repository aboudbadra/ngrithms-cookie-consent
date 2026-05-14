import {
  Directive,
  EmbeddedViewRef,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { ConsentService } from '../services/consent.service';

/**
 * Conditionally render template content based on per-item consent.
 *
 * @example
 * <div *ngrIfConsent="'google_analytics'">
 *   <iframe src="..."></iframe>
 * </div>
 *
 * Optional `else` template:
 *
 * @example
 * <div *ngrIfConsent="'google_analytics'; else placeholder">...</div>
 * <ng-template #placeholder>Enable analytics to see this content.</ng-template>
 */
@Directive({
  selector: '[ngrIfConsent]',
  standalone: true,
})
export class IfConsentDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly consent = inject(ConsentService);

  /** The `CookieItem.key` to gate on. */
  readonly ngrIfConsent = input.required<string>();
  /** Optional template to show when consent is not granted. */
  readonly ngrIfConsentElse = input<TemplateRef<unknown> | null>(null);

  private currentView: EmbeddedViewRef<unknown> | null = null;
  private currentElseView: EmbeddedViewRef<unknown> | null = null;

  constructor() {
    effect(() => {
      const granted = this.consent.isGranted(this.ngrIfConsent())();
      this.render(granted);
    });
  }

  private render(granted: boolean): void {
    if (granted) {
      this.clearElse();
      if (!this.currentView) {
        this.currentView = this.vcr.createEmbeddedView(this.templateRef);
      }
    } else {
      this.clearMain();
      const elseTpl = this.ngrIfConsentElse();
      if (elseTpl && !this.currentElseView) {
        this.currentElseView = this.vcr.createEmbeddedView(elseTpl);
      }
    }
  }

  private clearMain(): void {
    if (this.currentView) {
      this.currentView.destroy();
      this.currentView = null;
    }
  }

  private clearElse(): void {
    if (this.currentElseView) {
      this.currentElseView.destroy();
      this.currentElseView = null;
    }
  }
}
