"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { signup } from "@/app/auth/actions/auth";
import { SpinningBorderButton } from "@/components/ui/spinning-border-button";

export function RegisterForm() {
  return (
    <form action={signup} className="p-2">
      <div className="space-y-6 p-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="relative flex items-center justify-center p-4 rounded-xl border-2 border-secondary cursor-pointer transition-all hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent/5 group">
               <input type="radio" name="role" value="buyer" defaultChecked className="absolute opacity-0" />
               <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-black uppercase">Buyer</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase text-center">Acquire Assets</span>
               </div>
            </label>
            <label className="relative flex items-center justify-center p-4 rounded-xl border-2 border-secondary cursor-pointer transition-all hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent/5 group">
               <input type="radio" name="role" value="seller" className="absolute opacity-0" />
               <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-black uppercase">Seller</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase text-center">List Business</span>
               </div>
            </label>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1" htmlFor="full_name">
            Legal Full Name
          </label>
          <Input id="full_name" name="full_name" type="text" placeholder="John Doe" required className="h-12 rounded-xl border-2 border-secondary focus:border-accent transition-all font-bold" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1" htmlFor="email">
            Email Address
          </label>
          <Input id="email" name="email" type="email" placeholder="name@example.com" required className="h-12 rounded-xl border-2 border-secondary focus:border-accent transition-all font-bold" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1" htmlFor="password">
            Security Key (Password)
          </label>
          <Input id="password" name="password" type="password" required className="h-12 rounded-xl border-2 border-secondary focus:border-accent transition-all font-bold" />
        </div>
        <div className="p-4 rounded-xl bg-secondary/20 border border-secondary">
           <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">
             By creating an account, you agree to our{" "}
             <Link href="/terms" className="text-accent hover:underline">Marketplace Terms</Link>{" "}
             and{" "}
             <Link href="/privacy" className="text-accent hover:underline">Privacy Charter</Link>.
           </p>
        </div>
      </div>
      <div className="flex flex-col gap-6 p-8 pt-0">
        <SubmitButton />
        <div className="text-[10px] font-black uppercase tracking-widest text-center text-muted-foreground">
          Already a member?{" "}
          <Link href="/login" className="text-primary hover:text-accent transition-colors underline decoration-2 underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <SpinningBorderButton
      className="w-full h-14"
      type="submit"
      loading={pending}
    >
       Create Identity
    </SpinningBorderButton>
  );
}
