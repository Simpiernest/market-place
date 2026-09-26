import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">New Password</CardTitle>
          <CardDescription>
            Create a secure password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">
              New Password
            </label>
            <Input id="password" type="password" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="confirm-password">
              Confirm Password
            </label>
            <Input id="confirm-password" type="password" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Update Password</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
