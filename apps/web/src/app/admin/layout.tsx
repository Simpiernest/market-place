import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  History,
  Settings,
  LogOut
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Role check
  const role = user.user_metadata?.role;
  if (role !== 'admin' && role !== 'super_admin') {
    // redirect("/dashboard");
  }

  const navItems = [
    { title: "Overview", href: "/admin", icon: LayoutDashboard },
    { title: "Listings", href: "/admin/listings", icon: Briefcase },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Verification", href: "/admin/verification", icon: ShieldCheck },
    { title: "Audit Logs", href: "/admin/audit", icon: History },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-primary text-white flex flex-col border-r border-white/10 shrink-0">
        <div className="p-8">
          <Link href="/" className="flex items-center space-x-3 mb-1">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="h-8 w-auto rounded-lg" />
            <span className="text-xl font-black tracking-tight italic uppercase">
              ADMIN <span className="text-accent">BRIDGE</span>
            </span>
          </Link>
          <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-white/40">
            System control
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-white/5 text-white/60 hover:text-white group"
            >
              <item.icon className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest">
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
