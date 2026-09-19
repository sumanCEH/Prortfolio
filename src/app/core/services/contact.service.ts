import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

/** Thrown when the EmailJS keys are still the placeholders. */
export class ContactNotConfiguredError extends Error {
  constructor() {
    super('EmailJS is not configured yet.');
    this.name = 'ContactNotConfiguredError';
  }
}

/** Sends the contact form through EmailJS straight from the browser. */
@Injectable({ providedIn: 'root' })
export class ContactService {
  isConfigured(): boolean {
    const { emailjsServiceId, emailjsTemplateId, emailjsPublicKey } = environment;
    return [emailjsServiceId, emailjsTemplateId, emailjsPublicKey].every(
      (v) => !!v && v !== 'REPLACE_ME',
    );
  }

  async send(payload: ContactPayload): Promise<void> {
    if (!this.isConfigured()) throw new ContactNotConfiguredError();

    // Lazy-loaded so the EmailJS SDK is only fetched when someone actually submits.
    const { default: emailjs } = await import('@emailjs/browser');
    await emailjs.send(
      environment.emailjsServiceId,
      environment.emailjsTemplateId,
      {
        from_name: payload.name,
        reply_to: payload.email,
        message: payload.message,
      },
      { publicKey: environment.emailjsPublicKey },
    );
  }
}
