import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CV_DATA } from '../../../assets/data/cv-data';
import { ContactNotConfiguredError, ContactService } from '../../core/services/contact.service';
import { GlassCardComponent } from '../../shared/glass-card/glass-card.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/ui-button/button.component';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

/** 'fallback' = the form can't send by itself, so the visitor is offered ready-made email links. */
type Status = 'idle' | 'sending' | 'success' | 'error' | 'fallback';

@Component({
  selector: 'app-contact',
  imports: [
    ReactiveFormsModule,
    SectionHeadingComponent,
    GlassCardComponent,
    ButtonComponent,
    IconComponent,
    RevealDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly contactSvc = inject(ContactService);

  protected readonly contact = CV_DATA.contact;
  protected readonly mailto = computed(() =>
    this.contact.email ? `mailto:${this.contact.email}` : null,
  );
  /** Tap-to-call links for every public number. */
  protected readonly phones = this.contact.phones.map((label) => ({
    label,
    href: `tel:${label.replace(/[^\d+]/g, '')}`,
  }));
  /** Opens a WhatsApp chat with a friendly opener already typed in. */
  protected readonly whatsappHref = this.contact.whatsapp
    ? `https://wa.me/${this.contact.whatsapp}?text=${encodeURIComponent(
        `Hi ${CV_DATA.profile.name.split(' ')[0]}, I found your portfolio and would like to connect.`,
      )}`
    : null;

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    // Honeypot: real people never see or fill this; bots often do.
    website: [''],
  });

  protected readonly status = signal<Status>('idle');
  protected readonly errorText = signal('');
  /** Prefilled email links shown when EmailJS is not configured. */
  protected readonly fallbackLinks = signal<{ mailto: string; gmail: string } | null>(null);
  protected readonly submitted = signal(false);

  protected readonly sending = computed(() => this.status() === 'sending');

  /** Error message for a field once it was touched or the form was submitted. */
  protected fieldError(name: 'name' | 'email' | 'message'): string | null {
    const c = this.form.controls[name];
    if (!c.invalid || !(c.touched || this.submitted())) return null;

    const label = { name: 'Name', email: 'Email', message: 'Message' }[name];
    if (c.hasError('required')) return `${label} is required.`;
    if (c.hasError('email')) return 'Enter a valid email address.';
    if (c.hasError('minlength')) {
      const min = c.getError('minlength').requiredLength as number;
      return `${label} must be at least ${min} characters.`;
    }
    if (c.hasError('maxlength')) return `${label} is too long.`;
    return 'Please check this field.';
  }

  protected async onSubmit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.sending()) return;

    const { name, email, message, website } = this.form.getRawValue();

    // Honeypot tripped: pretend success, send nothing.
    if (website) {
      this.finishSuccess();
      return;
    }

    this.status.set('sending');
    try {
      await this.contactSvc.send({ name: name.trim(), email: email.trim(), message: message.trim() });
      this.finishSuccess();
    } catch (err) {
      // No EmailJS keys yet: hand the visitor a ready-to-send email instead of a dead end.
      if (err instanceof ContactNotConfiguredError && this.contact.email) {
        this.fallbackLinks.set(this.buildEmailLinks(name.trim(), email.trim(), message.trim()));
        this.status.set('fallback');
        return;
      }
      this.status.set('error');
      this.errorText.set('Something went wrong sending your message. Please try again in a moment.');
    }
  }

  /** Builds an email app link and a Gmail compose link with the visitor's message filled in. */
  private buildEmailLinks(name: string, email: string, message: string) {
    const subject = `Portfolio message from ${name}`;
    const body = `${message}\n\n${name}\n${email}`;
    const to = this.contact.email;
    const q = (s: string) => encodeURIComponent(s);
    return {
      mailto: `mailto:${to}?subject=${q(subject)}&body=${q(body)}`,
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${q(to)}&su=${q(subject)}&body=${q(body)}`,
    };
  }

  private finishSuccess(): void {
    this.status.set('success');
    this.form.reset();
    this.submitted.set(false);
  }
}
