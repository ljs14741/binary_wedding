import type { Metadata } from "next";
import { Noto_Serif_KR, Playfair_Display, Pinyon_Script } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
    title: "Binary Wedding",
    description: "Invitation",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
        <body className={`${notoserif.variable} ${playfair.variable} ${pinyon.variable} font-serif antialiased bg-[#F9F9F9]`}>
        {children}
        </body>
        </html>
    );
}