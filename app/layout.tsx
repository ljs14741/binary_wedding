import type { Metadata } from "next";
import { Noto_Serif_KR, Playfair_Display, Pinyon_Script } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";
import { getBaseUrl } from "@/lib/site";

// 1. 한국어 명조체 (진지하고 고급짐)
const notoserif = Noto_Serif_KR({
    subsets: ["latin"],
    weight: ["200", "400", "600"],
    variable: "--font-noto",
});

// 2. 영어 제목용 (잡지 느낌)
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair"
});

// 3. 영어 필기체 (감성 포인트)
const pinyon = Pinyon_Script({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-pinyon"
});

const baseUrl = getBaseUrl();

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
};

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: "무료 모바일 청첩장 제작 | 모청 - Binary Wedding",
        template: "%s | Binary Wedding",
    },
    description:
        "모바일 청첩장(모청) 무료로 만들기. 회원가입 없이 10분 만에 제작, 광고·결제 없음. 클래식 화이트 등 예쁜 템플릿, 지도 연동, 방명록, 계좌 안내. 대한민국 1등 무료 모청 서비스.",
    keywords: [
        "모바일 청첩장",
        "모청",
        "무료 모바일 청첩장",
        "모바일 청첩장 만들기",
        "모청 만들기",
        "무료 모청",
        "모바일 청첩장 제작",
        "결혼 청첩장",
        "웨딩 청첩장",
        "전자 청첩장",
    ],
    authors: [{ name: "Binary Wedding" }],
    creator: "Binary Wedding",
    publisher: "Binary Wedding",
    formatDetection: { email: false, address: false, telephone: false },
    openGraph: {
        type: "website",
        locale: "ko_KR",
        url: baseUrl,
        siteName: "Binary Wedding - 무료 모바일 청첩장",
        title: "무료 모바일 청첩장 제작 | 모청 - Binary Wedding",
        description: "회원가입·광고 없이 100% 무료. 10분 만에 나만의 모바일 청첩장을 만드세요. 클래식 디자인, 지도·방명록 지원.",
        images: [
            {
                url: `${baseUrl}/images/og-image.png`,
                width: 1200,
                height: 630,
                alt: "Binary Wedding 무료 모바일 청첩장",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "무료 모바일 청첩장 제작 | 모청 - Binary Wedding",
        description: "회원가입·광고 없이 100% 무료. 10분 만에 나만의 모바일 청첩장을 만드세요.",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    alternates: {
        canonical: baseUrl,
    },
    verification: {
        // Google Search Console: google: "발급코드" 추가
        other: { "naver-site-verification": "0d7c6650f829bee40b0dfbf0d8bb3e7ab51181a1" },
    },
    category: "wedding",
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": `${baseUrl}/#organization`,
            name: "Binary Wedding",
            url: baseUrl,
            logo: { "@type": "ImageObject", url: `${baseUrl}/logo.png` },
            description: "무료 모바일 청첩장(모청) 제작 서비스",
        },
        {
            "@type": "WebApplication",
            "@id": `${baseUrl}/#webapp`,
            name: "Binary Wedding - 무료 모바일 청첩장",
            url: baseUrl,
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
            description: "회원가입·광고 없이 100% 무료로 모바일 청첩장을 제작할 수 있는 서비스",
            inLanguage: "ko",
        },
        {
            "@type": "WebPage",
            "@id": `${baseUrl}/#webpage`,
            url: baseUrl,
            name: "무료 모바일 청첩장 제작 | 모청 - Binary Wedding",
            description: "모바일 청첩장(모청) 무료로 만들기. 회원가입 없이 10분 만에 제작.",
            isPartOf: { "@id": `${baseUrl}/#webapp` },
        },
    ],
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
        <body className={`${notoserif.variable} ${playfair.variable} ${pinyon.variable} font-serif antialiased bg-[#F9F9F9]`}>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ToastProvider>
            {children}
        </ToastProvider>
        </body>
        </html>
    );
}