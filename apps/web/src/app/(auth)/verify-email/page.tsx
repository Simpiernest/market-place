import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ResendForm } from "@/components/auth/resend-form";

export default function VerifyEmailPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md text-center p-6">
        <CardHeader className="space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Mail className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address. Please click the link to confirm your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or click below to resend.
          </p>
          <ResendForm />
        </CardContent>
        <div className="pt-6 border-t mt-6">
          <Link href="/login" className="text-sm text-accent hover:underline font-bold flex items-center justify-center">
            Back to Login
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}