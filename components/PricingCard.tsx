"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { v4 as uuidv4 } from "uuid";

declare global {
  interface Window {
    IMP?: any;
  }
}

const PRICE = 349000;
const PRODUCT_NAME = "시크릿클래스 프리미엄";

export default function PricingCard() {
  const supabase = createClient();
  const [msg, setMsg] = useState<string>("");

  async function startPayment() {
    setMsg("");

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) {
      window.location.href = "/auth?next=/";
      return;
    }

    // 1) 주문서(merchant_uid) 생성: 우리 DB에 먼저 저장(ready)
    const merchant_uid = `sc_${uuidv4()}`;
    const { error: orderErr } = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchant_uid, amount: PRICE, name: PRODUCT_NAME }),
    }).then(r => r.json());

    if (orderErr) {
      setMsg(`주문 생성 실패: ${orderErr}`);
      return;
    }

    // 2) PortOne 결제창 호출 (V1: IMP.request_pay)
    const IMP = window.IMP;
    if (!IMP) {
      setMsg("결제 모듈 로딩 실패(IMP 없음).");
      return;
    }

    IMP.init(process.env.NEXT_PUBLIC_PORTONE_IMP_CODE);

    IMP.request_pay(
      {
        pg: "html5_inicis",
        pay_method: "card",
        merchant_uid,
        name: PRODUCT_NAME,
        amount: PRICE,
        buyer_email: user.email,
      },
      async (rsp: any) => {
        if (!rsp?.success) {
          setMsg(rsp?.error_msg ? `결제 실패: ${rsp.error_msg}` : "결제 취소/실패");
          return;
        }

        // 3) 서버에서 '사후 검증' (imp_uid 기반 결제 조회 → 금액/merchant_uid 확인)
        const res = await fetch("/api/portone/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imp_uid: rsp.imp_uid, merchant_uid }),
        }).then(r => r.json());

        if (res.ok) {
          setMsg("결제 완료! 강의실로 이동합니다.");
          window.location.href = "/classroom";
        } else {
          setMsg(`결제 검증 실패: ${res.message || "unknown"}`);
        }
      }
    );
  }

  return (
    <div className="card">
      <div className="muted" style={{ textDecoration: "line-through" }}>699,000원</div>
      <div className="row" style={{ alignItems: "baseline" }}>
        <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.03em" }}>349,000</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>원</div>
        <span style={{ marginLeft: 10, padding: "6px 10px", background: "#ef4444", color: "#fff", borderRadius: 999, fontWeight: 800 }}>50% OFF</span>
      </div>

      <button className="btn primary" style={{ width: "100%", marginTop: 14 }} onClick={startPayment}>
        카드 / 간편결제 신청
      </button>

      <button className="btn" style={{ width: "100%", marginTop: 10 }} onClick={() => alert("무통장 입금은 별도 안내 페이지로 연결하세요.")}>
        무통장 입금 신청
      </button>

      {msg && <div style={{ marginTop: 10 }} className={msg.includes("실패") ? "error" : "success"}>{msg}</div>}
      <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
        * 결제 성공 후에도 서버 검증 실패 시 권한이 부여되지 않습니다(위변조 방지).
      </div>
    </div>
  );
}
