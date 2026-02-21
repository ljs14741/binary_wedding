import { Metadata } from "next";

export const metadata: Metadata = {
    title: "내 청첩장 수정·삭제",
    description: "생성한 모바일 청첩장을 수정하거나 삭제합니다. 비밀번호와 연락처로 본인 확인 후 수정 가능.",
};

export default function CheckLayout({ children }: { children: React.ReactNode }) {
    return children;
}
