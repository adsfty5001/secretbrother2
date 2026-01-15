# Secretclass (Next.js + Supabase + PortOne)

## 1) 설치
```bash
npm i
cp .env.example .env.local
npm run dev
```

## 2) Supabase 설정
- Supabase 프로젝트 생성
- SQL Editor에서 `supabase/schema.sql` 실행
- Project Settings -> API에서 URL/ANON/SERVICE ROLE KEY를 `.env.local`에 입력

## 3) PortOne(아임포트) 설정 (V1 기준)
- `.env.local`에:
  - `NEXT_PUBLIC_PORTONE_IMP_CODE=imp07764510`
  - `PORTONE_API_KEY`, `PORTONE_API_SECRET` 입력
- 결제 검증은 서버에서 PortOne REST API로 결제내역을 조회하여 금액/merchant_uid를 비교합니다.

## 4) 배포 (Vercel)
- GitHub에 이 프로젝트를 올립니다.
- Vercel에서 Import 후 Environment Variables에 `.env.local` 값을 그대로 등록
- Build Command: `next build`, Output: Next.js 기본값

## 5) 기존 정적 사이트(HTML+Firebase)에서 옮길 때
- 기존 디자인(CSS/HTML)은 `app/page.tsx`와 `app/globals.css`에 붙여넣어 유지하면 됩니다.
