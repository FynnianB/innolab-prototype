const NEW_NAV_COOKIE = "reqwise.new-nav";

export function isNewNavEnabled(): boolean {
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(NEW_NAV_COOKIE + "=1"));
}

export function enableNewNav(): void {
  document.cookie = `${NEW_NAV_COOKIE}=1; path=/; max-age=31536000`;
}

export function disableNewNav(): void {
  document.cookie = `${NEW_NAV_COOKIE}=; path=/; max-age=0`;
}
