"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import SiteFooter from "./site-footer";

/**
 * Renders the global Header + Footer only on "app" routes.
 * Standalone pages like /landing and /login manage their own nav/footer.
 */
const STANDALONE_ROUTES = ["/landing", "/login"];

export default function ConditionalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((r) => pathname.startsWith(r));

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
