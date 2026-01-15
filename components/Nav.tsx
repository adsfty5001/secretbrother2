"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function Nav() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="nav">
      <Link href="/" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>시크릿클래스</Link>
      <div className="row">
        <Link className="btn ghost" href="/classroom">나의강의실</Link>
        {email ? (
          <>
            <span className="muted" style={{ fontSize: 13 }}>{email}</span>
            <button className="btn" onClick={logout}>로그아웃</button>
          </>
        ) : (
          <Link className="btn" href="/auth">로그인/회원가입</Link>
        )}
      </div>
    </div>
  );
}
