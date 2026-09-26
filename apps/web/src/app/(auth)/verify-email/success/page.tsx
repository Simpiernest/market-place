import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerificationSuccessPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md text-center p-6 border-green-100 bg-green-50/10">
        <CardHeader className="space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary uppercase italic">Email <span className="text-accent">Verified.</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-muted-foreground font-medium">
            Your account has been successfully verified. You can now choose your role and start your acquisition journey.
          </p>
          <Link href="/onboarding/role">
            <Button size="lg" className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/10">
              Choose Your Role
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
