"use client";

import Link from "next/link";
import { Coffee, Heart, MessageCircle } from "lucide-react";

interface SupportNudgeProps {
    /** card: 만들기/수정 하단용 / plain: 첫 모달 등 기존 껍데기 안 */
    variant?: "card" | "plain";
    className?: string;
    footer?: React.ReactNode;
    /** 후원하기 클릭 시 추가 동작 (예: 안내 모달 닫기) */
    onDonateClick?: () => void;
}

export default function SupportNudge({
    variant = "card",
    className = "",
    footer,
    onDonateClick,
}: SupportNudgeProps) {
    const openDonate = () => {
        onDonateClick?.();
        window.dispatchEvent(new CustomEvent("openDonateModal"));
    };

    const body = (
        <>
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-5">
                <Heart size={24} fill="currentColor" />
            </div>
            <h5 className="font-serif text-xl font-bold text-slate-900 mb-3 tracking-tight">
                정말 무료인가요?
            </h5>
            <p className="text-sm text-slate-500 leading-[1.8] font-medium">
                네, 100% 무료입니다! 6년 차 개발자인 제가{" "}
                <b>미래의 제 결혼식에 직접 쓰려고</b> 정성껏 만들었거든요.
                <br />
                <br />
                예쁘게 사용해 주시고, 마음에 드신다면 커피 한 잔으로 제작자를 응원해 주세요. ☕{" "}
                <span className="font-bold text-rose-500">사실 치킨 먹고 싶어요!! 🍗</span>
                <br />
                <br />
                후원이 부담스러우시면, 이용후기 한 줄만 남겨주셔도 큰 힘이 됩니다.
                <br />
                마음에 드신 점이나 아쉬운 점을 알려주시면 다음 분들께도, 무료로 계속 운영하는 데에도 도움이 됩니다.
                <br />
                부탁드립니다 🙏
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
                <button
                    type="button"
                    onClick={openDonate}
                    className="w-full py-3.5 bg-[#FEE500] text-[#191919] font-black rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                    <Coffee size={14} /> 후원하기
                </button>
                <Link
                    href="/reviews"
                    className="w-full py-3.5 bg-white text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                >
                    <MessageCircle size={14} /> 이용후기
                </Link>
            </div>

            {footer}
        </>
    );

    if (variant === "plain") {
        return <div className={`relative z-10 ${className}`}>{body}</div>;
    }

    return (
        <section
            className={`bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100 ${className}`}
        >
            {body}
        </section>
    );
}
