import type { Metadata } from "next";

// 만들기·수정 화면 안 iframe 전용. 검색 노출 안 함
export const metadata: Metadata = {
    title: "미리보기",
    robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
    return children;
}
