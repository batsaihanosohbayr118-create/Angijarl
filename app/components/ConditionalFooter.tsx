"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "./SiteFooter";

const hiddenFooterPaths = new Set(["/login", "/register", "/admin"]);

export default function ConditionalFooter() {
  const pathname = usePathname();

  if (hiddenFooterPaths.has(pathname)) {
    return null;
  }

  return <SiteFooter />;
}
