// Thin wrapper over the Matomo `_paq` queue. Matomo is loaded by CookieConsent
// (cookieless until measurement consent is granted), so `_paq` is always safe to
// push to — events queue and are sent honoring the current consent mode.
type Paq = unknown[][];

// Populates Matomo's "Site Search" reports (keywords, no-result keywords,
// categories). Pass `false` as category when none applies, per Matomo's API.
export function trackSiteSearch(
  keyword: string,
  category: string | false,
  resultsCount: number,
): void {
  if (typeof window === "undefined") return;
  const _paq = (window as unknown as { _paq?: Paq })._paq;
  if (!_paq) return;
  _paq.push(["trackSiteSearch", keyword, category, resultsCount]);
}

export function trackEvent(
  category: string,
  action: string,
  name?: string,
  value?: number,
): void {
  if (typeof window === "undefined") return;
  const _paq = (window as unknown as { _paq?: Paq })._paq;
  if (!_paq) return;
  const event: unknown[] = ["trackEvent", category, action];
  if (name !== undefined) event.push(name);
  if (value !== undefined) event.push(value);
  _paq.push(event);
}
