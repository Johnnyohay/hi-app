/** Converts an ISO 3166-1 alpha-2 country code (e.g. "us") into its flag emoji. */
export function countryFlagEmoji(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()].map((char) => 0x1f1e6 - 65 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/** The flag emoji followed by a space, or '' when there's no code yet — avoids a stray leading space. */
export function flagPrefix(countryCode: string | null | undefined): string {
  const flag = countryFlagEmoji(countryCode);
  return flag ? `${flag} ` : '';
}
