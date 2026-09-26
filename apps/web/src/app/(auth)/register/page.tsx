import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
              <CardTitle className="text-2xl font-black uppercase italic tracking-tight">Join Network.</CardTitle>
              <CardDescription className="font-medium text-muted-foreground">
                Begin your acquisition or exit journey today
              </CardDescription>
           </div>
        </CardHeader>

        {error && (
          <div className="mx-8 mt-6 p-4 text-xs font-black uppercase tracking-widest text-destructive bg-destructive/5 rounded-xl border border-destructive/10 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error.replace(/%20/g, ' ')}
          </div>
        )}

        <RegisterForm />
      </Card>
    </div>
  );
}
