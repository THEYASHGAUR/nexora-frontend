import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const next = searchParams.get("next") ?? "/ai-mock-interview";
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page or login with error message
  return NextResponse.redirect(`${origin}/login?error=Could%20not%20authenticate%20user`);
}
