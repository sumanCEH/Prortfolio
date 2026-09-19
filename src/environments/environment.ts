/**
 * Development environment.
 *
 * EmailJS powers the contact form without a backend. BEFORE DEPLOYING:
 *   1. Create a free account at https://www.emailjs.com
 *   2. Add an email service and a template (template variables used by the
 *      form: {{from_name}}, {{reply_to}}, {{message}})
 *   3. Paste the real Service ID, Template ID and Public Key below and in
 *      environment.prod.ts.
 *
 * While these are 'REPLACE_ME' the form shows a friendly "not configured"
 * message instead of failing silently.
 */
export const environment = {
  /**
   * Public URL of the deployed site, used for canonical/Open Graph URLs.
   * TODO: replace with the real Vercel URL or custom domain, and update the
   * same address in public/robots.txt and public/sitemap.xml.
   */
  siteUrl: 'https://sumanceh.github.io/Prortfolio',
  production: false,
  emailjsServiceId: 'REPLACE_ME',
  emailjsTemplateId: 'REPLACE_ME',
  emailjsPublicKey: 'REPLACE_ME',
};
