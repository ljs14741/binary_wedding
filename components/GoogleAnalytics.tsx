"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const GA_MEASUREMENT_ID =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-0TSFJBQ41N";

export default function GoogleAnalytics() {
    const pathname = usePathname();

    // 관리자·미리보기(만들기 화면 안 iframe) 페이지는 수집 안 함
    if (!GA_MEASUREMENT_ID || pathname?.startsWith("/admin") || pathname?.startsWith("/preview")) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
            </Script>
        </>
    );
}
