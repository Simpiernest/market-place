"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function NavbarWrapper() {
  const pathname = usePathname();
  if (!pathname) return null;

  // Use explicit path checks to prevent public navbar from leaking into dashboards
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isAuth = pathname.startsWith("/login") ||
                 pathname.startsWith("/register") ||
                 pathname.startsWith("/forgot-password") ||
                 pathname.startsWith("/auth");

  if (isDashboard || isAdmin || isAuth) return null;
  return <Navbar />;
}

export function FooterWrapper() {
  const pathname = usePathname();
  if (!pathname) return null;

  const isDashboard = pathname.includes("/dashboard");
  const isAdmin = pathname.includes("/admin");
  const isAuth = pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/forgot-password");

  if (isDashboard || isAdmin || isAuth) return null;
  return <Footer />;
}
