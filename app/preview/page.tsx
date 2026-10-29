"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { getTemplateComponent } from "@/components/templates";
import { PreviewModeProvider } from "@/components/invitation/PreviewMode";
import type { PreviewMessage, PreviewPayload, PreviewSection } from "@/lib/preview";

/** 강조 표시 유지 시간 */
const FLASH_MS = 1600;
/** 칸을 빠르게 옮겨 다닐 때 마지막 칸에서만 움직이도록 기다림 */
const FOCUS_SETTLE_MS = 220;
/** 이동했을 때 위쪽 여유 (딱 붙으면 무슨 부분인지 헷갈림) */
const SCROLL_MARGIN = 28;

/**
 * 문서 기준 실제 위치. 등장 애니메이션(아래서 떠오르기)이 끝나기 전이면 getBoundingClientRect가
 * 그만큼 아래로 나와서, 애니메이션과 상관없는 레이아웃 위치(offsetTop)로 계산
 */
function layoutTop(el: HTMLElement): number {
    let y = 0;
    for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
    return y;
}

/**
 * 만들기·수정 화면 왼쪽(모바일은 전체화면) iframe 안에서 도는 실시간 미리보기.
 * 부모 창이 폼 값을 postMessage로 보내면 실제 템플릿에 그대로 꽂아 그림
 */
export default function PreviewPage() {
    const [payload, setPayload] = useState<PreviewPayload | null>(null);
    const [focus, setFocus] = useState<{ section: PreviewSection; detail?: string; seq: number } | null>(null);

    useEffect(() => {
        const onMessage = (e: MessageEvent<PreviewMessage>) => {
            // 같은 사이트의 부모 창 메시지만 받음
            if (e.origin !== window.location.origin || e.source !== window.parent) return;
            const msg = e.data;
            // 부모가 늦게 준비된 경우 다시 알려줌
            if (msg?.type === "preview-hello") window.parent.postMessage({ type: "preview-ready" } satisfies PreviewMessage, window.location.origin);
            else if (msg?.type === "preview-data") setPayload(msg.payload);
            else if (msg?.type === "preview-focus") setFocus({ section: msg.section, detail: msg.detail, seq: msg.seq });
        };
        window.addEventListener("message", onMessage);
        window.parent.postMessage({ type: "preview-ready" } satisfies PreviewMessage, window.location.origin);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    // 청첩장을 누르면 부모 화면에 알려서 고칠 칸을 열게 함 (버튼 원래 동작은 그대로)
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-preview-section]");
            const section = el?.dataset.previewSection?.split(" ")[0] as PreviewSection | undefined;
            if (!section) return;
            const detail = (e.target as Element).closest<HTMLElement>("[data-preview-detail]")?.dataset.previewDetail;
            window.parent.postMessage({ type: "preview-pick", section, detail } satisfies PreviewMessage, window.location.origin);
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    // 아직 없는 섹션으로 가려던 경우 (예: 인터뷰 답을 쓰기 전) 나타나면 이동
    const pendingRef = useRef<PreviewSection | null>(null);
    const flashTimerRef = useRef(0);

    /** 해당 위치로 이동 + 잠깐 강조. 못 찾으면 false */
    const goTo = useCallback((section: PreviewSection) => {
        const el = document.querySelector<HTMLElement>(`[data-preview-section~="${section}"]`);
        if (!el) return false;
        // scrollIntoView는 바깥 만들기 화면까지 같이 스크롤해서 쓰면 안 됨 → 미리보기 안에서만 스크롤
        // 이미 화면 위쪽에 다 보이면 움직이지 않고 강조만 (왔다갔다 줄이기)
        const top = layoutTop(el);
        const viewTop = top - window.scrollY;
        const visible = viewTop >= 0 && viewTop < window.innerHeight * 0.5;
        if (!visible) window.scrollTo({ top: Math.max(0, top - SCROLL_MARGIN), behavior: "smooth" });
        el.classList.remove("preview-flash");
        void el.offsetWidth; // 같은 곳 연속 강조 시 애니메이션 다시 시작
        el.classList.add("preview-flash");
        window.clearTimeout(flashTimerRef.current);
        flashTimerRef.current = window.setTimeout(() => el.classList.remove("preview-flash"), FLASH_MS);
        return true;
    }, []);

    // 입력 칸 바뀌면 이동 (웨딩홈피는 템플릿이 탭을 바꾼 뒤 찾도록 두 프레임 기다림)
    useEffect(() => {
        if (!focus) return;
        pendingRef.current = focus.section;
        const timer = window.setTimeout(() => {
            if (pendingRef.current && goTo(pendingRef.current)) pendingRef.current = null;
        }, FOCUS_SETTLE_MS);
        return () => window.clearTimeout(timer);
    }, [focus, goTo]);

    // 내용이 바뀌어 기다리던 섹션이 생겼으면 그때 이동 (타이핑마다 다시 스크롤하진 않음)
    useEffect(() => {
        if (!pendingRef.current) return;
        const raf = requestAnimationFrame(() => requestAnimationFrame(() => {
            if (pendingRef.current && goTo(pendingRef.current)) pendingRef.current = null;
        }));
        return () => cancelAnimationFrame(raf);
    }, [payload, goTo]);

    return (
        <>
            <style>{`
                html, body { scrollbar-width: none; }
                html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
                .preview-flash { position: relative; }
                .preview-flash::after {
                    content: ""; position: absolute; inset: 6px; border-radius: 20px; pointer-events: none; z-index: 40;
                    box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.55);
                    animation: preview-flash ${FLASH_MS}ms ease-out forwards;
                }
                @keyframes preview-flash { 0%, 60% { opacity: 1; } 100% { opacity: 0; } }
            `}</style>
            {payload ? (
                <PreviewModeProvider value={true}>
                {createElement(getTemplateComponent(payload.templateType), {
                    // 메인 사진 장수가 바뀌면 슬라이드 순번이 범위를 넘으므로 새로 그림
                    key: `${payload.templateType}-${payload.data.mainImages.length}`,
                    data: payload.data,
                    isSample: true,
                    previewFocus: focus,
                })}
                </PreviewModeProvider>
            ) : (
                <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6]">
                    <div className="w-6 h-6 border-2 border-rose-200 border-t-rose-400 rounded-full animate-spin" />
                </div>
            )}
        </>
    );
}
