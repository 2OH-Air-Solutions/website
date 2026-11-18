// Every fact used on the site lives here, and every value must match
// business-facts.md (the owner-approved source of truth). Change both together.

export const business = {
  legalName: '2-OH Air Solutions LLC',
  name: '2.0 Air',
  altName: '2-OH Air',
  url: 'https://2ohairsolutions.com',
  phone: '(509) 903-8595',
  phoneHref: 'tel:+15099038595',
  phoneE164: '+1-509-903-8595',
  email: 'Gabriel@2ohairsolutions.com',
  hours: 'Monday–Friday, 7am–5pm',
  hoursSchema: 'Mo-Fr 07:00-17:00',
  towns: {
    washington: ['Spokane', 'Spokane Valley', 'Liberty Lake', 'Cheney'],
    idaho: ["Coeur d'Alene", 'Post Falls', 'Hayden', 'Rathdrum'],
  },
  regionShort: 'Spokane and North Idaho',
} as const;

export const allTowns = [...business.towns.washington, ...business.towns.idaho];
