"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Eye, X, MousePointerClick, PencilLine } from "lucide-react";
import { getPreviewCoords } from "@/app/actions";
import {
    buildPreviewPayload, previewTargetOf, formTargetSelectors, PREVIEW_SECTION_LABEL,
    type PreviewImages, type PreviewMessage, type PreviewSection, type PreviewTarget,
} from "@/lib/preview";

/** 타이핑 후 미리보기 반영까지 대기 */
const DEBOUNCE_MS = 120;
/** 입력 이벤트 없이 바뀌는 값(주소 검색, 호칭 선택 등) 확인 주기 */
const POLL_MS = 700;
/** 폼 쪽 강조 유지 시간 */
const FORM_FLASH_MS = 1600;

interface Props {
    formRef: RefObject<HTMLFormElement | null>;
    images: PreviewImages;
    /** 폼을 새로 그리면(임시저장 복원 등) 바꿔서 이벤트를 다시 붙임 */
    formVersion?: number;
}

const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

/** 접힌 '+ 추가' 항목 안이면 펼침. 펼쳤으면 true */
function revealIfFolded(el: Element): boolean {
    const folded = el.closest(".hidden");
    const opener = folded?.previousElementSibling;
    if (opener instanceof HTMLButtonElement) {
        opener.click();
        return true;
    }
    return false;
}

/**
 * 만들기·수정 실시간 미리보기.
 * PC(lg~): 왼쪽에 붙어 따라오는 휴대폰 화면 / 모바일: 하단 '미리보기' 버튼 → 전체화면
 * 입력 칸을 누르면 청첩장의 해당 위치로 이동·강조하고, 반대로 청첩장을 누르면 고칠 칸으로 이동함
 */
export default function LivePreview({ formRef, images, formVersion = 0 }: Props) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const readyRef = useRef(false);
    const lastSentRef = useRef("");
    const focusRef = useRef<(PreviewTarget & { seq: number }) | null>(null);
    const imagesRef = useRef(images);
    const coordsRef = useRef<{ lat: number; lng: number } | null>(null);
    const geoRef = useRef<{ address: string; cache: Map<string, { lat: number; lng: number } | null> }>({ address: "", cache: new Map() });
    /** 미리보기를 눌러 폼 칸에 포커스 줄 때는 다시 미리보기를 움직이지 않음 */
    const suppressFocusRef = useRef(false);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [typing, setTyping] = useState(false);
    const [usesSamplePhotos, setUsesSamplePhotos] = useState(true);
    const [section, setSection] = useState<PreviewSection | null>(null);
    /** 모바일: 미리보기에서 누른 곳 (하단 '수정하기' 버튼) */
    const [mobilePick, setMobilePick] = useState<PreviewTarget | null>(null);

    const post = useCallback((msg: PreviewMessage) => {
        const win = iframeRef.current?.contentWindow;
        if (win && readyRef.current) win.postMessage(msg, window.location.origin);
    }, []);

    /** 주소가 바뀌었으면 좌표 조회 (지도 표시용, 주소당 한 번) */
    const syncCoords = useCallback((address: string, onDone: () => void) => {
        const geo = geoRef.current;
        if (address === geo.address) return;
        geo.address = address;
        if (!address) { coordsRef.current = null; return; }
        if (geo.cache.has(address)) { coordsRef.current = geo.cache.get(address) ?? null; return; }
        getPreviewCoords(address)
            .catch(() => null)
            .then((c) => {
                geo.cache.set(address, c);
                if (geoRef.current.address !== address) return;
                coordsRef.current = c;
                onDone();
            });
    }, []);

    /** 폼 값 읽어서 바뀐 게 있으면 미리보기로 보냄 */
    const sync = useCallback((force = false) => {
        const form = formRef.current;
        if (!form || !readyRef.current) return;
        const address = String(new FormData(form).get("location_address") ?? "").trim();
        syncCoords(address, () => sync(true));
        const payload = buildPreviewPayload(form, imagesRef.current, coordsRef.current);
        const key = JSON.stringify(payload);
        if (!force && key === lastSentRef.current) return;
        lastSentRef.current = key;
        setUsesSamplePhotos(payload.usesSamplePhotos);
        post({ type: "preview-data", payload });
    }, [formRef, post, syncCoords]);

    const sendFocus = useCallback((target: PreviewTarget) => {
        const seq = (focusRef.current?.seq ?? 0) + 1;
        focusRef.current = { ...target, seq };
        setSection(target.section);
        post({ type: "preview-focus", ...target, seq });
    }, [post]);

    /** 미리보기에서 누른 곳 → 폼의 해당 칸으로 스크롤·강조 (접혀 있으면 펼침) */
    const openFormTarget = useCallback((target: PreviewTarget) => {
        const form = formRef.current;
        if (!form) return;
        const el = formTargetSelectors(target)
            .map((sel) => form.querySelector<HTMLElement>(sel))
            .find(Boolean);
        if (!el) return;
        const go = () => {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            if (el.matches("input, textarea, select")) {
                suppressFocusRef.current = true;
                el.focus({ preventScroll: true });
                suppressFocusRef.current = false;
            }
            const box = el.matches("input, textarea, select") ? (el.closest(".space-y-2") ?? el) : el;
            box.classList.remove("form-pick-flash");
            void (box as HTMLElement).offsetWidth;
            box.classList.add("form-pick-flash");
            window.setTimeout(() => box.classList.remove("form-pick-flash"), FORM_FLASH_MS);
        };
        // 펼친 뒤 화면에 그려지면 이동
        if (revealIfFolded(el)) requestAnimationFrame(() => requestAnimationFrame(go));
        else go();
    }, [formRef]);

    // iframe 메시지: 준비 완료 / 미리보기 누름
    useEffect(() => {
        const onMessage = (e: MessageEvent<PreviewMessage>) => {
            if (e.origin !== window.location.origin || e.source !== iframeRef.current?.contentWindow) return;
            const msg = e.data;
            if (msg?.type === "preview-ready") {
                readyRef.current = true;
                sync(true);
                if (focusRef.current) post({ type: "preview-focus", ...focusRef.current });
            } else if (msg?.type === "preview-pick") {
                const target = { section: msg.section, detail: msg.detail };
                // PC는 옆에 폼이 보여서 바로 이동, 모바일은 미리보기를 가리지 않게 버튼으로 물어봄
                if (isDesktop()) openFormTarget(target);
                else setMobilePick(target);
            }
        };
        window.addEventListener("message", onMessage);
        // iframe이 먼저 떠서 ready를 놓쳤을 수 있으니 한 번 물어봄 (아직 안 떴으면 iframe이 뜨면서 ready 보냄)
        iframeRef.current?.contentWindow?.postMessage({ type: "preview-hello" } satisfies PreviewMessage, window.location.origin);
        return () => window.removeEventListener("message", onMessage);
    }, [sync, post, openFormTarget]);

    // 사진 바뀌면 바로 반영
    useEffect(() => {
        imagesRef.current = images;
        sync();
    }, [images, sync]);

    // 입력 이벤트 + 주기 확인 (값이 같으면 안 보냄)
    useEffect(() => {
        const form = formRef.current;
        if (!form) return;
        let timer = 0;
        const schedule = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => sync(), DEBOUNCE_MS);
        };
        form.addEventListener("input", schedule);
        form.addEventListener("change", schedule);
        const poll = window.setInterval(() => sync(), POLL_MS);
        return () => {
            form.removeEventListener("input", schedule);
            form.removeEventListener("change", schedule);
            window.clearTimeout(timer);
            window.clearInterval(poll);
        };
    }, [formRef, sync, formVersion]);

    // 입력 칸 누르면 해당 위치로 (사진 영역·호칭 선택 등 이름 없는 칸은 data-preview 로 지정)
    useEffect(() => {
        const form = formRef.current;
        if (!form) return;
        const targetFrom = (el: EventTarget | null): PreviewTarget | null => {
            if (!(el instanceof Element)) return null;
            const marked = el.closest<HTMLElement>("[data-preview]")?.dataset.preview;
            if (marked) return { section: marked as PreviewSection };
            return previewTargetOf((el as HTMLInputElement).name ?? "");
        };
        const onFocusIn = (e: FocusEvent) => {
            const el = e.target as HTMLElement;
            // 모바일 키보드 올라오면 하단 버튼 숨김
            if (el.matches("input:not([type=file]):not([type=hidden]), textarea, select")) setTyping(true);
            if (suppressFocusRef.current) return;
            const next = targetFrom(el);
            if (next) sendFocus(next);
        };
        const onFocusOut = () => setTyping(false);
        // 포커스가 안 가는 영역(사진 칸 등) 클릭
        const onClick = (e: MouseEvent) => {
            const marked = (e.target as Element | null)?.closest?.<HTMLElement>("[data-preview]")?.dataset.preview;
            if (marked) sendFocus({ section: marked as PreviewSection });
        };
        form.addEventListener("focusin", onFocusIn);
        form.addEventListener("focusout", onFocusOut);
        form.addEventListener("click", onClick);
        return () => {
            form.removeEventListener("focusin", onFocusIn);
            form.removeEventListener("focusout", onFocusOut);
            form.removeEventListener("click", onClick);
        };
    }, [formRef, sendFocus, formVersion]);

    // 모바일 전체화면: 뒤 페이지 스크롤 막고, 열 때 마지막 입력 위치로
    useEffect(() => {
        if (!mobileOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        if (focusRef.current) sendFocus(focusRef.current);
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
        // 열릴 때 한 번만
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mobileOpen]);

    const closeMobile = () => {
        setMobileOpen(false);
        setMobilePick(null);
    };

    /** 모바일: 미리보기 닫고 누른 곳 고치러 감 */
    const editPicked = () => {
        const target = mobilePick;
        closeMobile();
        if (target) requestAnimationFrame(() => requestAnimationFrame(() => openFormTarget(target)));
    };

    return (
        <>
            {/* 모바일: 하단 미리보기 버튼 (키보드 올라와 있으면 숨김) */}
            {!mobileOpen && !typing && (
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="lg:hidden fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-slate-900 text-white text-sm font-bold shadow-xl shadow-slate-900/30 active:scale-95 transition-transform"
                >
                    <Eye size={18} /> 미리보기
                </button>
            )}

            <aside
                aria-label="청첩장 미리보기"
                className={`${mobileOpen ? "max-lg:fixed max-lg:inset-0 max-lg:z-[150] max-lg:flex max-lg:bg-white" : "max-lg:hidden"} flex-col lg:order-first lg:sticky lg:top-24 lg:self-start`}
            >
                {/* 모바일 상단 바 */}
                <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white pt-[calc(0.75rem+env(safe-area-inset-top))]">
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">미리보기</p>
                        <p className="text-[11px] text-slate-400 truncate">
                            {usesSamplePhotos ? "사진은 올리기 전까지 예시로 보여요" : "고칠 곳을 누르면 바로 갈 수 있어요"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={closeMobile}
                        className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold active:scale-95"
                    >
                        <X size={14} /> 닫고 계속 작성
                    </button>
                </div>

                {/* PC 상단 안내 */}
                <div className="hidden lg:flex items-center justify-between mb-3 px-1">
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span className="relative flex w-2 h-2">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60 animate-ping" />
                            <span className="relative inline-flex w-2 h-2 rounded-full bg-rose-500" />
                        </span>
                        실시간 미리보기
                    </p>
                    {usesSamplePhotos && (
                        <span className="text-[11px] text-slate-400">사진은 올리기 전까지 예시</span>
                    )}
                </div>

                {/* 휴대폰 틀 (PC) / 꽉 찬 화면 (모바일) */}
                <div className="relative max-lg:flex-1 max-lg:min-h-0 lg:w-[391px] lg:rounded-[2.75rem] lg:border-[8px] lg:border-slate-900 lg:bg-slate-900 lg:shadow-2xl lg:shadow-slate-900/20 overflow-hidden">
                    <iframe
                        ref={iframeRef}
                        src="/preview"
                        title="청첩장 미리보기"
                        className="block w-full h-full lg:w-[375px] lg:h-[min(760px,calc(100vh-11rem))] lg:rounded-[2.2rem] bg-white"
                    />

                    {/* 모바일: 누른 곳 고치러 가기 */}
                    {mobilePick && (
                        <div className="lg:hidden absolute inset-x-0 bottom-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-center pointer-events-none">
                            <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/30 animate-fade-in-up">
                                <button type="button" onClick={editPicked} className="flex items-center gap-2 pl-5 pr-3 py-3 text-sm font-bold active:scale-95">
                                    <PencilLine size={16} /> {PREVIEW_SECTION_LABEL[mobilePick.section]} 수정하기
                                </button>
                                <button type="button" onClick={() => setMobilePick(null)} aria-label="닫기" className="pr-4 pl-1 py-3 text-white/60">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* PC 하단 안내 */}
                <p className="hidden lg:flex items-center justify-center gap-1.5 mt-3 text-[11px] text-slate-400">
                    <MousePointerClick size={13} />
                    {section ? "입력 중인 부분을 표시하고 있어요 · 청첩장을 누르면 그 칸으로 가요" : "청첩장을 누르면 고칠 칸으로, 칸을 누르면 그 위치로 가요"}
                </p>
            </aside>
        </>
    );
}
