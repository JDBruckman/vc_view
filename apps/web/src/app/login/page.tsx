import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="mx-auto mt-20 max-w-md px-4">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Mock Login with Amazon (development only)
          </p>
        </CardHeader>
        <CardContent>
          <form action="/auth/mock" method="post" className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="analyst@company.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full bg-yellow-400">
              Sign in with Amazon
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
