"use client";

import { useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, X } from "lucide-react";
import { KakaoSdk, shareSiteKakao } from "@/components/invitation/KakaoShare";
import { useToast } from "@/components/ui/ToastProvider";
import { SITE_SHARE } from "@/lib/shareMessage";

/** GA 공유 이벤트. place 로 어느 위치 버튼인지 구분함 */
export function trackShare(method: string, place: string, target = "site") {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    w.gtag?.("event", "share", { method, content_type: target, item_id: place });
}

/** 클립보드 복사. 권한 막힌 환경은 prompt 로 대체 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        window.prompt("아래 내용을 복사해 주세요.", text);
        return false;
    }
}

const noopSubscribe = () => () => {};

/** 휴대폰 화면 여부. 인스타 버튼은 휴대폰에서만 보임 (PC 인스타는 링크 받을 방법이 없음). 서버 렌더는 false */
export function useIsMobile() {
    return useSyncExternalStore(noopSubscribe, () => window.innerWidth < 768, () => false);
}

/** 기기 공유창 사용 가능 여부 (카톡·인스타 인앱 브라우저는 대부분 안 됨) */
export function useCanNativeShare() {
    const isMobile = useIsMobile();
    return isMobile && typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function KakaoIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.86 5.35 4.66 6.77-.15.53-.97 3.4-1 3.62 0 0-.02.17.09.24.11.06.24.01.24.01.32-.04 3.7-2.42 4.28-2.83.56.08 1.14.12 1.73.12 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
        </svg>
    );
}

export function InstagramIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
        </svg>
    );
}

interface SiteShareButtonsProps {
    /** GA 구분용 위치 이름 (main, reviews, created 등) */
    place: string;
    /** 바깥에서 덧붙일 클래스 */
    className?: string;
}

/** 사이트 공유 버튼 묶음: 카톡 · 링크 복사 · (휴대폰) 인스타 */
export default function SiteShareButtons({ place, className = "" }: SiteShareButtonsProps) {
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const canNativeShare = useCanNativeShare();

    const siteUrl = () => window.location.origin;

    const onKakao = () => {
        if (!shareSiteKakao(place)) {
            toast("카카오톡 공유를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
            return;
        }
        trackShare("kakao", place);
    };

    const onCopy = async () => {
        const ok = await copyToClipboard(`${SITE_SHARE.copyText}\n${siteUrl()}`);
        if (ok) toast("링크가 복사되었습니다. 친구에게 붙여넣어 주세요!");
        trackShare("copy", place);
    };

    // 공유창 되면 공유창, 안 되면(카톡 인앱·PC) 링크 복사 후 DM 붙여넣기 안내
    const onInstagram = async () => {
        if (canNativeShare) {
            try {
                await navigator.share({ title: SITE_SHARE.title, text: SITE_SHARE.copyText, url: siteUrl() });
                trackShare("native", place);
            } catch {
                // 사용자가 공유창을 닫은 경우 무시
            }
            return;
        }
        const ok = await copyToClipboard(`${SITE_SHARE.copyText}\n${siteUrl()}`);
        if (ok) toast("링크가 복사되었습니다. 인스타 DM에 붙여넣어 주세요!");
        trackShare("instagram_copy", place);
    };

    const btn = "flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-3.5 whitespace-nowrap rounded-xl font-bold text-sm transition-all active:scale-95";

    return (
        <div className={`flex gap-2 w-full ${className}`}>
            <KakaoSdk />
            <button type="button" onClick={onKakao} className={`${btn} bg-[#FEE500] text-[#191919] hover:brightness-95`}>
                <KakaoIcon /> 카카오톡
            </button>
            <button type="button" onClick={onCopy} className={`${btn} bg-white text-slate-700 border border-slate-200 hover:bg-slate-50`}>
                <Link2 size={18} /> 링크 복사
            </button>
            {isMobile && (
                <button type="button" onClick={onInstagram} className={`${btn} bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:brightness-105`}>
                    <InstagramIcon /> 인스타
                </button>
            )}
        </div>
    );
}

interface SiteShareModalProps {
    open: boolean;
    onClose: () => void;
    place: string;
}

/** 사이트 공유 모달 (헤더 공유하기, 후기 페이지 등에서 씀) */
export function SiteShareModal({ open, onClose, place }: SiteShareModalProps) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center font-sans">
                    <motion.div
                        className="absolute inset-0 bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        role="dialog"
                        aria-label="친구에게 알려주기"
                        className="relative w-full sm:max-w-sm bg-white rounded-t-[2rem] sm:rounded-[2rem] px-6 pt-8 pb-[calc(1.75rem+env(safe-area-inset-bottom))] text-center shadow-2xl"
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="닫기"
                            className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition"
                        >
                            <X size={22} />
                        </button>
                        <div className="text-3xl mb-3">💌</div>
                        <h3 className="text-lg font-bold text-slate-900">결혼 준비 중인 친구에게</h3>
                        <p className="text-sm text-slate-500 mt-1.5 mb-6">무료로 만들 수 있다고 알려주세요</p>
                        <SiteShareButtons place={place} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
