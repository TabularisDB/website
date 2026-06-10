// Thin wrapper over the Matomo `_paq` queue. Matomo is loaded by CookieConsent
// (cookieless until measurement consent is granted), so `_paq` is always safe to
// push to — events queue and are sent honoring the current consent mode.
type Paq = unknown[][];

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
