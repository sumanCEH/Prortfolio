/**
 * Production environment (used by `ng build`).
 *
 * IMPORTANT: Suman must create a free EmailJS account (https://www.emailjs.com),
 * set up a service + template, and paste the real IDs here before deploying.
 * The EmailJS public key is designed to be exposed in browser code; restrict
 * it to your domain in the EmailJS dashboard (Account > Security).
 */
export const environment = {
  /**
   * Public URL of the deployed site, used for canonical/Open Graph URLs.
   * Public URL (GitHub Pages project site). If you add a custom domain, change this and the
   * same address in public/robots.txt and public/sitemap.xml.
   */
  siteUrl: 'https://sumanceh.github.io/Prortfolio',
  production: true,
  emailjsServiceId: 'REPLACE_ME',
  emailjsTemplateId: 'REPLACE_ME',
  emailjsPublicKey: 'REPLACE_ME',
};
