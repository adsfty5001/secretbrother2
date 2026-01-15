import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { merchant_uid, amount, name } = body ?? {};
    if (!merchant_uid || !amount || !name) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const supabase = createAdminClient();
    // 주문 저장(ready)
    const { error } = await supabase.from("orders").insert({
      merchant_uid,
      amount,
      name,
      status: "ready",
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}
