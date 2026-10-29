"use client";

import { createContext, useContext } from "react";

/** 만들기·수정 실시간 미리보기 안이면 true (샘플 페이지와 안내 문구를 다르게) */
const PreviewModeContext = createContext(false);

export const PreviewModeProvider = PreviewModeContext.Provider;

/** 만들기·수정 미리보기 안인지 */
export function useIsPreview() {
    return useContext(PreviewModeContext);
}

type BlockedAction = "call" | "sms" | "share" | "guestbook" | "alarm" | "reminderSms";

const SAMPLE_TEXT: Record<BlockedAction, string> = {
    call: "샘플 화면에서는 전화를 걸 수 없습니다.",
    sms: "샘플 화면에서는 문자를 보낼 수 없습니다.",
    share: "샘플 화면에서는 카카오톡 공유를 사용할 수 없습니다.",
    guestbook: "샘플 페이지에서는 작성이 불가능합니다.",
    alarm: "샘플 화면에서는 실제 알림 기능을 사용할 수 없습니다.",
    reminderSms: "샘플 화면에서는 실제 문자 기능을 사용할 수 없습니다.",
};

const PREVIEW_TEXT: Record<BlockedAction, string> = {
    call: "미리보기라 전화는 연결되지 않아요. 완성된 청첩장에서는 바로 걸려요.",
    sms: "미리보기라 문자는 보내지 않아요. 완성된 청첩장에서는 바로 보낼 수 있어요.",
    share: "완성한 뒤에 카카오톡으로 공유할 수 있어요.",
    guestbook: "완성된 청첩장에서 하객분들이 남길 수 있어요.",
    alarm: "완성된 청첩장에서 하객분들이 쓸 수 있어요.",
    reminderSms: "완성된 청첩장에서 하객분들이 쓸 수 있어요.",
};

/** 샘플/미리보기에서 막힌 동작 안내 문구 */
export function useBlockedText() {
    const isPreview = useContext(PreviewModeContext);
    return (action: BlockedAction) => (isPreview ? PREVIEW_TEXT : SAMPLE_TEXT)[action];
}

/** 미리보기에서만: 아직 안 쓴 항목 자리를 점선 상자로 보여줌 (실제 청첩장엔 안 나옴) */
export function PreviewHint({ children, className = "", section }: { children: React.ReactNode; className?: string; section?: string }) {
    const isPreview = useContext(PreviewModeContext);
    if (!isPreview) return null;
    return (
        <div data-preview-section={section}
             className={`rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-4 py-4 text-center text-[12px] leading-relaxed text-rose-400 ${className}`}>
            {children}
        </div>
    );
}
