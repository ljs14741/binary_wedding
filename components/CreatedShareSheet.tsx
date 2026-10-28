"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, X } from "lucide-react";
import { shareKakao } from "@/components/invitation/KakaoShare";
import type { InvitationData } from "@/components/invitation/types";
import { copyToClipboard, trackShare, useCanNativeShare, KakaoIcon, InstagramIcon } from "@/components/SiteShare";
import { buildShareTitle } from "@/lib/shareMessage";
import { useToast } from "@/components/ui/ToastProvider";

/**
 * 청첩장 만들기 완료 직후 제작자에게만 한 번 띄우는 공유 시트.
 * 생성 액션이 ?created=1 을 붙여 보내고, 열리자마자 주소에서 지움
 * (그 주소를 그대로 복사해 보내도 하객에게는 안 뜸)
 */
export default function CreatedShareSheet({ data }: { data: InvitationData }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const canNativeShare = useCanNativeShare();

    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get("created") !== "1") return;
        url.searchParams.delete("created");
        window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
        // 청첩장 첫 화면을 잠깐 보여준 뒤 올림
        const t = window.setTimeout(() => setOpen(true), 900);
        return () => window.clearTimeout(t);
    }, []);

    const cardUrl = () => `${window.location.origin}/${data.url_id}`;

    const onKakaoMine = () => {
        if (!window.Kakao) {
            toast("카카오톡 공유를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
            return;
        }
        shareKakao(data);
        trackShare("kakao", "created", "invitation");
    };

    const onCopyMine = async () => {
        if (await copyToClipboard(cardUrl())) toast("내 청첩장 링크가 복사되었습니다.");
        trackShare("copy", "created", "invitation");
    };

    // 공유창 되면 공유창, 안 되면 링크 복사 후 DM 붙여넣기 안내
    const onInstagramMine = async () => {
        if (canNativeShare) {
            try {
                await navigator.share({ title: buildShareTitle(data.groom.name, data.bride.name), url: cardUrl() });
                trackShare("native", "created", "invitation");
            } catch {
                // 사용자가 공유창을 닫은 경우 무시
            }
            return;
        }
        if (await copyToClipboard(cardUrl())) toast("내 청첩장 링크가 복사되었습니다. 인스타 DM에 붙여넣어 주세요!");
        trackShare("instagram_copy", "created", "invitation");
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
                    <motion.div
                        className="absolute inset-0 bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                    />
                    <motion.div
                        role="dialog"
                        aria-label="청첩장 완성"
                        className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] px-6 pt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] font-sans shadow-2xl"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    >
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="닫기"
                            className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition"
                        >
                            <X size={22} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="text-4xl mb-3">🎉</div>
                            <h3 className="text-xl font-bold text-slate-900">청첩장이 완성됐어요!</h3>
                            <p className="text-sm text-slate-500 mt-1.5">
                                {data.groom.name} ♥ {data.bride.name}, 결혼을 진심으로 축하드려요.
                            </p>
                        </div>

                        {/* 내 청첩장 보내기 */}
                        <p className="text-[13px] font-bold text-slate-700 mb-2">먼저 내 청첩장을 보내보세요</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={onKakaoMine} className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-3.5 whitespace-nowrap rounded-xl font-bold text-sm active:scale-95 transition-all bg-[#FEE500] text-[#191919] hover:brightness-95">
                                <KakaoIcon /> 카카오톡
                            </button>
                            <button type="button" onClick={onCopyMine} className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-3.5 whitespace-nowrap rounded-xl font-bold text-sm active:scale-95 transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50">
                                <Link2 size={18} /> 링크 복사
                            </button>
                            <button type="button" onClick={onInstagramMine} className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-3.5 whitespace-nowrap rounded-xl font-bold text-sm active:scale-95 transition-all bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:brightness-105">
                                <InstagramIcon /> 인스타
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="w-full mt-5 py-3 text-sm font-semibold text-slate-400 hover:text-slate-600 transition"
                        >
                            청첩장 둘러보기
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
