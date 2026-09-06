/**
 * Every company fact the site renders lives here, so a correction is one edit
 * rather than a search across components.
 */

export const SITE = {
  name: 'Threadwork Software',
  legalName: 'Threadwork Software, Inc.',
  url: 'https://www.threadworksoftware.com',
  foundingDate: '2006',
  foundingLocation: 'Alberta, Canada',

  // Confirmed delivering 2026-08-18 (Dan): routes to daniel@threadworksoftware.com
  // through the domain's Google Workspace mail. Nothing else in the repo
  // hardcodes it. This is the only contact route the site publishes, so an
  // address that bounces would defeat the page's whole purpose (OQ-482).
  email: 'hello@threadworksoftware.com',
} as const;

/**
 * Provenance facts. These exist because the credibility question this site has
 * to answer is not "what do you do", it is "have you been here long enough to
 * still be here when my audit is". A reader who doubts that runs a WHOIS on the
 * domain, gets January 2026, and needs somewhere on the page to go next.
 *
 * registryNumber is the whole point of the block: it is the one token that lets
 * a reader confirm the incorporation date without taking the site's word for
 * anything. Leave it empty and the row does not render, rather than shipping a
 * placeholder that reads worse than an omission.
 */
export const ENTITY = {
  jurisdiction: 'Alberta, Canada',
  jurisdictionRegion: 'AB',
  jurisdictionCountry: 'CA',

  // Year for prose, full date for the record. The Verify table and the JSON-LD
  // both take the ISO form, because both are read as evidence rather than copy.
  incorporated: '2006',
  incorporatedIso: '2006-02-16',
  incorporatedLabel: 'February 16, 2006',

  registryNumber: '2012239469',
  registryLabel: 'Alberta corporate access number',
  registryAuthority: 'Alberta Corporate Registry',

  // Kept as the record even though no component renders them: the Verify table
  // dropped the rename date (a reader who cares can pull it from the registry),
  // and the timeline rounds it to the month ("January 2026") as a literal.
  renamedOnIso: '2026-01-21',
  renamedOnLabel: 'January 21, 2026',
  domainRegisteredIso: '2026-01-13',
  domainRegisteredLabel: 'January 13, 2026',

  // The gap between those two dates is written as a word ("eight days") in
  // PROVENANCE_FAQ, because it reads as prose there. Change either date and
  // that sentence needs the new number.
} as const;

export const PRODUCT = {
  name: 'OpenSCORM',
  url: 'https://www.openscorm.com',
  betaDate: 'July 2025',
  launchDate: 'July 2026',
} as const;

/**
 * Rendered visibly by Provenance.astro AND emitted as FAQPage structured data by
 * index.astro, both from this one array. Same discipline as openscorm/www's post
 * template: visible copy and structured data cannot drift apart if there is only
 * one copy of the text.
 */
export const PROVENANCE_FAQ = [
  {
    question: 'How long has Threadwork Software been in business?',
    answer:
      'Since 2006. The corporation was registered in Alberta, Canada on February 16, 2006 under Alberta corporate access number 2012239469, and has operated continuously since. It adopted the Threadwork Software name in January 2026, which was a name change to an existing company rather than the formation of a new one: the same corporation, the same access number, and the same 2006 incorporation date.',
  },
  {
    question: 'Why was threadworksoftware.com only registered in 2026?',
    answer:
      'Because the name dates from 2026 and a domain follows its name. threadworksoftware.com was registered on January 13, 2026, eight days before the company adopted the name. Domain age measures a domain. The corporate register measures the company, and that is the record to check.',
  },
  {
    question: 'Is Threadwork Software the company behind OpenSCORM?',
    answer:
      'Yes. OpenSCORM was founded by Kyle Erickson and Dan Miller and is developed and operated by Threadwork Software, Inc. It went to a private beta group of existing clients in July 2025 and launched globally in July 2026. The company is not reselling a platform built by somebody else.',
  },
  {
    question: 'Where is Threadwork Software located?',
    answer:
      'Alberta, Canada. The company is Canadian, incorporated and registered in Alberta, and has worked with clients in the private sector, the public sector, and non-profit associations.',
  },
] as const;

export const METADATA = {
  title: 'Threadwork Software: IT consulting for training and education',
  description:
    'Threadwork Software, Inc. is a Canadian IT consultancy incorporated in Alberta in 2006, working with training, compliance, and professional development teams. We build and operate OpenSCORM.',
} as const;

export const NAV = [
  { href: '#what-we-do', label: 'What we do' },
  { href: '#clients', label: 'Who we work with' },
  { href: '#history', label: 'History' },
  { href: '#verify', label: 'Verify' },
  { href: '#openscorm', label: 'OpenSCORM' },
  { href: '#contact', label: 'Contact' },
] as const;
