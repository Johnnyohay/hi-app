/**
 * Schools "Hi" is available at. Starts with just Hult — add more entries
 * here once other schools sign on. Each school gates magic-link sign-in by
 * email domain until its IT team hands over real SSO (SAML/OIDC) details.
 */
export type School = {
  id: string;
  name: string;
  /** TODO: confirm the exact student email domain(s) with Hult IT — this is a starting guess. */
  emailDomains: string[];
  /** Flip once the school's SAML/OIDC metadata is wired in. */
  ssoReady: boolean;
};

export const schools: School[] = [
  {
    id: 'hult',
    name: 'Hult International Business School',
    emailDomains: ['hult.edu', 'my.hult.edu'],
    ssoReady: false,
  },
];

export const defaultSchool = schools[0];

export function isSchoolEmail(school: School, email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1];
  return Boolean(domain && school.emailDomains.includes(domain));
}
