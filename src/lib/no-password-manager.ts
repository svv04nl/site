// Velden die geen inlogformulier zijn. Wachtwoordmanagers bieden bij een e-mail- of codeveld
// op svv04.nl anders de admin-login aan. Deze attributen zetten dat voorstel uit
// (1Password, LastPass, Bitwarden, Dashlane); het autofill van de browser zelf blijft werken.
export const noPasswordManager = {
  'data-1p-ignore': true,
  'data-lpignore': 'true',
  'data-bwignore': 'true',
  'data-form-type': 'other',
} as const
