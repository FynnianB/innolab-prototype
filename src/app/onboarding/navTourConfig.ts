/** Feature-Cookie: Tab „Customer Journey“ in der Sidebar (wie in Sidebar.tsx). */
export function hasCustomerJourneyNavCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith("customer-journey="));
}
