import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ContactNotConfiguredError, ContactService } from '../../core/services/contact.service';
import { ContactComponent } from './contact.component';

function setup(send: () => Promise<void>) {
  TestBed.configureTestingModule({
    imports: [ContactComponent],
    providers: [{ provide: ContactService, useValue: { send: vi.fn(send), isConfigured: () => true } }],
  });
  const fixture = TestBed.createComponent(ContactComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const fill = (id: string, value: string) => {
    const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = async () => {
    el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
  };
  return { fixture, el, fill, submit };
}

describe('ContactComponent', () => {
  it('shows required errors and does not send when the form is empty', async () => {
    const { el, submit } = setup(() => Promise.resolve());
    await submit();
    const errors = [...el.querySelectorAll('.field__error')].map((e) => e.textContent?.trim());
    expect(errors).toEqual(['Name is required.', 'Email is required.', 'Message is required.']);
  });

  it('rejects an invalid email address', async () => {
    const { el, fill, submit } = setup(() => Promise.resolve());
    fill('c-name', 'Ada');
    fill('c-email', 'not-an-email');
    fill('c-message', 'A long enough message.');
    await submit();
    expect(el.querySelector('#c-email-error')?.textContent).toContain('valid email');
  });

  it('shows a success notice and resets the form after sending', async () => {
    const { el, fill, submit } = setup(() => Promise.resolve());
    fill('c-name', 'Ada');
    fill('c-email', 'ada@example.com');
    fill('c-message', 'A long enough message.');
    await submit();
    expect(el.querySelector('.notice--ok')).not.toBeNull();
    expect(el.querySelector<HTMLInputElement>('#c-name')!.value).toBe('');
  });

  it('offers ready-made email links when EmailJS is not configured, and keeps the typed values', async () => {
    const { el, fill, submit } = setup(() => Promise.reject(new ContactNotConfiguredError()));
    fill('c-name', 'Ada');
    fill('c-email', 'ada@example.com');
    fill('c-message', 'A long enough message.');
    await submit();
    const links = [...el.querySelectorAll<HTMLAnchorElement>('.notice__link')].map((a) => a.href);
    expect(links[0]).toMatch(/^mailto:.+\?subject=.+&body=.*A%20long%20enough%20message/);
    expect(links[1]).toContain('mail.google.com/mail/?view=cm');
    expect(el.querySelector<HTMLInputElement>('#c-name')!.value).toBe('Ada');
  });

  it('shows a generic error when sending fails for another reason', async () => {
    const { el, fill, submit } = setup(() => Promise.reject(new Error('network')));
    fill('c-name', 'Ada');
    fill('c-email', 'ada@example.com');
    fill('c-message', 'A long enough message.');
    await submit();
    expect(el.querySelector('.notice--error')?.textContent).toContain('Something went wrong');
  });

  it('links the WhatsApp chat and both phone numbers', () => {
    const { el } = setup(() => Promise.resolve());
    expect(el.querySelector<HTMLAnchorElement>('a.wa')?.href).toContain('https://wa.me/917029711346');
    const tels = [...el.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]')].map((a) => a.getAttribute('href'));
    expect(tels).toContain('tel:+917029711346');
    expect(tels).toContain('tel:+917602607017');
  });

  it('silently ignores submissions that fill the honeypot field', async () => {
    const send = vi.fn(() => Promise.resolve());
    const { fill, submit } = setup(send);
    fill('c-name', 'Bot');
    fill('c-email', 'bot@example.com');
    fill('c-message', 'Buy cheap stuff now please.');
    fill('c-website', 'http://spam.example');
    await submit();
    expect(send).not.toHaveBeenCalled();
  });
});
