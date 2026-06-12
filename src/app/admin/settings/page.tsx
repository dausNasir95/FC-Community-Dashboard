import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-white">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Storage and deployment</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-[#cbe5d2]">
          <p>Configure Supabase buckets named posters, tournaments, and collections.</p>
          <p>Set environment variables in Vercel using the values documented in README.md.</p>
          <p>Only server-side code should access SUPABASE_SERVICE_ROLE_KEY.</p>
        </CardContent>
      </Card>
    </div>
  );
}
