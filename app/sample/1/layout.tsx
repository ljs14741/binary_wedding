import { Metadata } from "next";

export const metadata: Metadata = {
    title: "클래식 화이트 샘플 | 모바일 청첩장 템플릿",
    description:
        "Binary Wedding 클래식 화이트 모바일 청첩장 샘플. 정갈하고 세련된 디자인으로 유행을 타지 않는 청첩장을 제작해 보세요.",
    openGraph: {
        title: "클래식 화이트 모바일 청첩장 샘플 - Binary Wedding",
        description: "유행을 타지 않는 정갈한 모바일 청첩장 템플릿 미리보기.",
    },
};

export default function SampleLayout({ children }: { children: React.ReactNode }) {
    return children;
}
