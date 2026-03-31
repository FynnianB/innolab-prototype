import { createContext, useContext } from "react";

export const MobileNavContext = createContext<{ openSidebar: () => void } | null>(
  null,
);

export function useMobileNav() {
  return useContext(MobileNavContext);
}
