import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getPortOneToken() {
  const key = process.env.PORTONE_API_KEY!;
  const secret = process.env.PORTONE_API_SECRET!;
  const res = await fetch("https://api.iamport.kr/users/getToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imp_key: key, imp_secret: secret }),
  });
  const json = await res.json();
  if (!json?.response?.access_token) throw new Error("portone_token_failed");
  return json.response.access_token as string;
}

async function getPayment(imp_uid: string, token: string) {
  const res = await fetch(`https://api.iamport.kr/payments/${imp_uid}`, {
    headers: { Authorization: token },
  });
  const json = await res.json();
  if (!json?.response) throw new Error("portone_payment_fetch_failed");
  return json.response;
}

export async function POST(req: Request) {
  try {
    const { imp_uid, merchant_uid } = await req.json();
    if (!imp_uid || !merchant_uid) return NextResponse.json({ ok: false, message: "missing_fields" }, { status: 400 });

    const token = await getPortOneToken();
    const payment = await getPayment(imp_uid, token);

    // 1) 위변조 방지: merchant_uid/amount/status 확인
    if (payment.merchant_uid !== merchant_uid) {
      return NextResponse.json({ ok: false, message: "merchant_uid_mismatch" }, { status: 400 });
    }
    if (payment.status !== "paid") {
      return NextResponse.json({ ok: false, message: `not_paid:${payment.status}` }, { status: 400 });
    }

    // 2) 우리 DB 주문 금액과 비교
    const supabase = createAdminClient();
    const { data: order } = await supabase.from("orders").select("amount, status").eq("merchant_uid", merchant_uid).maybeSingle();
    if (!order) return NextResponse.json({ ok: false, message: "order_not_found" }, { status: 404 });

    if (Number(order.amount) !== Number(payment.amount)) {
      return NextResponse.json({ ok: false, message: "amount_mismatch" }, { status: 400 });
    }

    // 3) 구매 기록 저장 + 멤버 권한 부여
    // payment.buyer_email 로 user 매칭(실서비스에서는 주문 생성 시 user_id를 함께 저장하는 방식이 더 안전합니다)
    const buyerEmail = payment.buyer_email;
    if (!buyerEmail) return NextResponse.json({ ok: false, message: "buyer_email_missing" }, { status: 400 });

    const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", buyerEmail).maybeSingle();
    if (!profile?.user_id) return NextResponse.json({ ok: false, message: "user_not_found_by_email" }, { status: 404 });

    // upsert purchase
    await supabase.from("purchases").upsert({
      merchant_uid,
      imp_uid,
      user_id: profile.user_id,
      amount: payment.amount,
      status: "paid",
      raw: payment,
    }, { onConflict: "merchant_uid" });

    // member pay_status complete
    await supabase.from("members").upsert({ user_id: profile.user_id, pay_status: "complete" }, { onConflict: "user_id" });

    // order status paid
    await supabase.from("orders").update({ status: "paid" }).eq("merchant_uid", merchant_uid);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message ?? "unknown" }, { status: 500 });
  }
}
