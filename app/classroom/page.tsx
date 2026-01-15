import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ClassroomPage() {
  const supabase = createClient();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  if (!user) {
    return (
      <div className="container">
        <Nav />
        <div className="card" style={{ marginTop: 20 }}>
          <p>로그인이 필요합니다.</p>
          <Link className="btn primary" href="/auth?next=/classroom">로그인 하러가기</Link>
        </div>
      </div>
    );
  }

  const { data: member } = await supabase.from("members").select("pay_status, role").eq("user_id", user.id).maybeSingle();

  if (member?.pay_status !== "complete") {
    return (
      <div className="container">
        <Nav />
        <div className="card" style={{ marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>결제 후 이용 가능합니다.</h2>
          <p className="muted">결제가 완료되면 자동으로 권한이 부여됩니다(서버 검증 기반).</p>
          <Link className="btn primary" href="/">결제하러 가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Nav />
      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>나의 강의실</h2>
        <p className="muted">현재는 기본 페이지입니다. 강의 목록/영상/자료를 여기에 붙이시면 됩니다.</p>
      </div>
    </div>
  );
}
