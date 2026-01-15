import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { user_id, username, email } = await req.json();

    if (!user_id || !username || !email) {
      return NextResponse.json({ ok: false, message: "missing_fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // username 중복 체크
    const { data: existing } = await supabase.from("usernames").select("username").eq("username", username).maybeSingle();
    if (existing) return NextResponse.json({ ok: false, message: "이미 사용 중인 아이디입니다." }, { status: 409 });

    // profiles
    await supabase.from("profiles").upsert({ user_id, username, email }, { onConflict: "user_id" });
    // usernames mapping
    await supabase.from("usernames").insert({ username, user_id });
    // members
    await supabase.from("members").upsert({ user_id, pay_status: "none", role: "user" }, { onConflict: "user_id" });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message ?? "unknown" }, { status: 500 });
  }
}
