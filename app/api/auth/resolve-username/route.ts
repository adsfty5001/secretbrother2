import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    if (!username) return NextResponse.json({ ok: false, message: "missing_username" }, { status: 400 });

    const supabase = createAdminClient();
    const { data: mapping } = await supabase.from("usernames").select("user_id").eq("username", username).maybeSingle();
    if (!mapping) return NextResponse.json({ ok: false, message: "아이디를 찾을 수 없습니다." }, { status: 404 });

    const { data: profile } = await supabase.from("profiles").select("email").eq("user_id", mapping.user_id).maybeSingle();
    if (!profile?.email) return NextResponse.json({ ok: false, message: "이메일 정보가 없습니다." }, { status: 404 });

    return NextResponse.json({ ok: true, email: profile.email });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message ?? "unknown" }, { status: 500 });
  }
}
