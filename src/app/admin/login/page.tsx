import { signInAdmin } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <p className="text-sm text-[#9fb6a7]">Use your Supabase admin account. With no Supabase env set, this redirects to the dev dashboard.</p>
        </CardHeader>
        <CardContent>
          {params.error ? <p className="mb-4 rounded-md border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-200">{params.error}</p> : null}
          <form action={signInAdmin} className="grid gap-4">
            <Field label="Email"><Input name="email" type="email" required defaultValue="admin@example.com" /></Field>
            <Field label="Password"><Input name="password" type="password" required /></Field>
            <Button type="submit">Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
