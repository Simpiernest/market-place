import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/app/auth/actions/auth";

export function ResendForm() {
  return (
    <form action={resendVerificationEmail} className="space-y-3">
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="w-full h-12 rounded-xl border-2 border-secondary bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:border-accent"
      />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" className="w-full" disabled={pending}>
      {pending ? "Sending..." : "Resend Email"}
    </Button>
  );
}