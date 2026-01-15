import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Secretclass",
  description: "Secretclass membership site",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* PortOne(아임포트) V1 JS SDK */}
        <Script src="https://code.jquery.com/jquery-1.12.4.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.iamport.kr/js/iamport.payment-1.2.0.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
