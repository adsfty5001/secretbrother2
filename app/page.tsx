import Nav from "@/components/Nav";
import PricingCard from "@/components/PricingCard";

export default function Page() {
  return (
    <div className="container">
      <Nav />
      <div style={{ padding: "24px 0" }}>
        <h1 style={{ fontSize: 32, margin: "10px 0" }}>프리미엄 서비스</h1>
        <p className="muted">회원가입 → 로그인 → 결제 완료 시, 강의실 접근이 열립니다.</p>
      </div>

      <div className="grid">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>1:1 맞춤형 투자 큐레이팅</h2>
          <p className="muted">원하시는 디자인/문구는 기존 index의 HTML/CSS를 그대로 옮겨 붙이시면 됩니다.</p>
          <ul>
            <li>결제 성공 → 서버에서 포트원 API로 검증 → Supabase DB에 권한 부여</li>
            <li>수강권/결제상태는 DB 기준으로만 판단</li>
          </ul>
        </div>
        <PricingCard />
      </div>
    </div>
  );
}
