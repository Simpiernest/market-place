import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardRootPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role || 'buyer';

  if (role === 'seller') {
    redirect("/dashboard/seller");
  } else if (role === 'broker') {
    redirect("/dashboard/broker");
  } else {
    redirect("/dashboard/buyer");
  }
}
