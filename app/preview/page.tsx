"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { getTemplateComponent } from "@/components/templates";
import type { PreviewMessage, PreviewPayload, PreviewSection } from "@/lib/preview";

/** 강조 표시 유지 시간 */
const FLASH_MS = 1600;

/**
 * 만들기·수정 화면 오른쪽(모바일은 전체화면) iframe 안에서 도는 실시간 미리보기.
 * 부모 창이 폼 값을 postMessage로 보내면 실제 템플릿에 그대로 꽂아 그림
 */
export default function PreviewPage() {
    const [payload, setPayload] = useState<PreviewPayload | null>(null);
    const [focus, setFocus] = useState<{ section: PreviewSection; seq: number } | null>(null);

    useEffect(() => {
        const onMessage = (e: MessageEvent<PreviewMessage>) => {
            // 같은 사이트의 부모 창 메시지만 받음
            if (e.origin !== window.location.origin || e.source !== window.parent) return;
            const msg = e.data;
            // 부모가 늦게 준비된 경우 다시 알려줌
            if (msg?.type === "preview-hello") window.parent.postMessage({ type: "preview-ready" } satisfies PreviewMessage, window.location.origin);
            else if (msg?.type === "preview-data") setPayload(msg.payload);
            else if (msg?.type === "preview-focus") setFocus({ section: msg.section, seq: msg.seq });
        };
        window.addEventListener("message", onMessage);
        window.parent.postMessage({ type: "preview-ready" } satisfies PreviewMessage, window.location.origin);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    // 아직 없는 섹션으로 가려던 경우 (예: 인터뷰 답을 쓰기 전) 나타나면 이동
    const pendingRef = useRef<PreviewSection | null>(null);
    const flashTimerRef = useRef(0);

    /** 해당 위치로 이동 + 잠깐 강조. 못 찾으면 false */
    const goTo = useCallback((section: PreviewSection) => {
        const el = document.querySelector<HTMLElement>(`[data-preview-section~="${section}"]`);
        if (!el) return false;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
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
        const raf = requestAnimationFrame(() => requestAnimationFrame(() => {
            if (pendingRef.current && goTo(pendingRef.current)) pendingRef.current = null;
        }));
        return () => cancelAnimationFrame(raf);
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
                createElement(getTemplateComponent(payload.templateType), {
                    // 메인 사진 장수가 바뀌면 슬라이드 순번이 범위를 넘으므로 새로 그림
                    key: `${payload.templateType}-${payload.data.mainImages.length}`,
                    data: payload.data,
                    isSample: true,
                    previewFocus: focus,
                })
            ) : (
                <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6]">
                    <div className="w-6 h-6 border-2 border-rose-200 border-t-rose-400 rounded-full animate-spin" />
                </div>
            )}
        </>
    );
}
