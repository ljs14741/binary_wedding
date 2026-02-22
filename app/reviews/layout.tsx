import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "이용후기",
    description: "Binary Wedding 무료 모바일 청첩장(모청)을 이용해 주신 분들의 생생한 후기입니다.",
};

export default function ReviewsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
