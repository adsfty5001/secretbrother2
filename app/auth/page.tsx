"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function AuthPage() {
  const supabase = createClient();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function login() {
    setMsg("");
    // 아이디 로그인 지원: username에 @가 없으면 서버에서 이메일로 변환
    let loginEmail = email;
    if (!loginEmail && username) {
      const res = await fetch("/api/auth/resolve-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      }).then(r => r.json());
      if (!res.ok) return setMsg(res.message || "아이디를 찾을 수 없습니다.");
      loginEmail = res.email;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    if (error) return setMsg(error.message);

    window.location.href = next;
  }

  async function signup() {
    setMsg("");
    if (!username) return setMsg("아이디를 입력해주세요.");
    if (!email) return setMsg("이메일을 입력해주세요.");
    if (password.length < 6) return setMsg("비밀번호는 6자리 이상으로 해주세요.");

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return setMsg(error.message);

    // 프로필/멤버 생성(서버에서 service role로 보강)
    const res = await fetch("/api/auth/after-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: data.user?.id, username, email }),
    }).then(r => r.json());

    if (!res.ok) return setMsg(res.message || "가입 후 처리 실패");
    window.location.href = next;
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>로그인 / 회원가입</h2>
          <a className="btn ghost" href="/">닫기</a>
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <button className={"btn " + (tab === "login" ? "primary" : "")} onClick={() => setTab("login")}>로그인</button>
          <button className={"btn " + (tab === "signup" ? "primary" : "")} onClick={() => setTab("signup")}>회원가입</button>
        </div>

        {tab === "login" ? (
          <div style={{ marginTop: 14 }}>
            <input className="input" placeholder="아이디(또는 이메일)" value={username} onChange={e => setUsername(e.target.value)} />
            <input className="input" style={{ marginTop: 10 }} placeholder="비밀번호" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="btn primary" style={{ width: "100%", marginTop: 12 }} onClick={login}>로그인</button>
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <input className="input" placeholder="아이디" value={username} onChange={e => setUsername(e.target.value)} />
            <input className="input" style={{ marginTop: 10 }} placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input" style={{ marginTop: 10 }} placeholder="비밀번호(6자리 이상)" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="btn primary" style={{ width: "100%", marginTop: 12 }} onClick={signup}>가입완료</button>
          </div>
        )}

        {msg && <div className={msg.includes("실패") ? "error" : "error"} style={{ marginTop: 10 }}>{msg}</div>}
        <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
          * 아이디 로그인: 아이디 → 이메일 매핑을 서버에서 조회 후 로그인합니다.
        </div>
      </div>
    </div>
  );
}
