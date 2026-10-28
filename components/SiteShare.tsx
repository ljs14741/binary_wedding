"use client";

import { useSyncExternalStore } from "react";
import { Link2 } from "lucide-react";
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

function KakaoIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.86 5.35 4.66 6.77-.15.53-.97 3.4-1 3.62 0 0-.02.17.09.24.11.06.24.01.24.01.32-.04 3.7-2.42 4.28-2.83.56.08 1.14.12 1.73.12 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
        </svg>
    );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
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

/** 사이트 공유 버튼 묶음: 카톡 · 링크 복사 · (휴대폰) 기기 공유 */
export default function SiteShareButtons({ place, className = "" }: SiteShareButtonsProps) {
    const { toast } = useToast();
    // 기기 공유는 휴대폰에서만 노출함 (PC 크롬 공유창은 어색함). 서버 렌더는 false
    const canNativeShare = useSyncExternalStore(
        noopSubscribe,
        () => typeof navigator.share === "function" && window.innerWidth < 768,
        () => false,
    );

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

    const onNative = async () => {
        try {
            await navigator.share({ title: SITE_SHARE.title, text: SITE_SHARE.copyText, url: siteUrl() });
            trackShare("native", place);
        } catch {
            // 사용자가 공유창을 닫은 경우 무시
        }
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
            {canNativeShare && (
                // 인스타 DM 등은 웹에서 바로 못 보내서 기기 공유창으로 넘김
                <button type="button" onClick={onNative} className={`${btn} bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:brightness-105`}>
                    <InstagramIcon /> 인스타
                </button>
            )}
        </div>
    );
}
