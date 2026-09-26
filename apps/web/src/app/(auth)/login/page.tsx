import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "@/app/auth/actions/auth";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden rounded-3xl">
        <CardHeader className="space-y-4 p-10 bg-secondary/10 border-b text-center">
           <div className="flex justify-center mb-2">
              <Link href="/" className="flex flex-col items-center gap-2">
                <Image src="/logo.png" alt="Business Bridge" width={64} height={64} className="h-16 w-auto rounded-2xl shadow-xl" />
                <span className="text-2xl font-black tracking-tighter italic uppercase text-primary">
                  BUSINESS <span className="text-accent">BRIDGE</span>
                </span>
              </Link>
           </div>
           <div className="space-y-1">
              <CardTitle className="text-2xl font-black uppercase italic tracking-tight">Log In.</CardTitle>
              <CardDescription className="font-medium text-muted-foreground">
                Enter your credentials to access the marketplace
              </CardDescription>
           </div>
        </CardHeader>
        <form action={login} className="p-2">
          <CardContent className="space-y-6 p-8">
            {error && (
              <div className="p-4 text-xs font-black uppercase tracking-widest text-destructive bg-destructive/5 rounded-xl border border-destructive/10 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {message && (
              <div className="p-4 text-xs font-black uppercase tracking-widest text-accent bg-accent/5 rounded-xl border border-accent/10 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </div>
            )}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1" htmlFor="email">
                Email Address
              </label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" required className="h-12 rounded-xl border-2 border-secondary focus:border-accent transition-all font-bold" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="password">
                  Security Key
                </label>
                <Link href="/forgot-password" title="Forgot Password" className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-primary transition-colors">
                  Reset?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required className="h-12 rounded-xl border-2 border-secondary focus:border-accent transition-all font-bold" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 p-8 pt-0">
            <Button className="w-full bg-primary text-white border-none font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-primary/10 hover:bg-accent transition-all text-lg italic" type="submit">
               Access Portal
            </Button>
            <div className="text-[10px] font-black uppercase tracking-widest text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-accent hover:text-primary transition-colors underline decoration-2 underline-offset-4">
                Join Today
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
