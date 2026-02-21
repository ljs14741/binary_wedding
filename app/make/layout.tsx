import { Metadata } from "next";

export const metadata: Metadata = {
    title: "모바일 청첩장 만들기",
    description:
        "무료로 모바일 청첩장(모청) 제작. 회원가입 없이 10분 만에 완성. 신랑신부 정보, 예식장, 지도, 계좌 안내, 방명록까지 한 번에.",
    openGraph: {
        title: "모바일 청첩장 만들기 | 무료 모청 제작 - Binary Wedding",
        description: "회원가입·광고 없이 100% 무료. 10분 만에 나만의 모바일 청첩장을 만드세요.",
    },
};

export default function MakeLayout({ children }: { children: React.ReactNode }) {
    return children;
}
