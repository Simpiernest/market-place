import { redirect } from "next/navigation";

export default function DisputesRedirectPage() {
  redirect("/dashboard/seller/resolution");
}
