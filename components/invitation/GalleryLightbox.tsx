"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
    images: string[];
    index: number | null;          // null이면 닫힘
    onClose: () => void;
    onChange: (idx: number) => void;
};

const MAX_SCALE = 4;
const SWIPE_THRESHOLD = 50;

/**
 * 갤러리 사진 전체화면 뷰어.
 * - 원본 비율 그대로(object-contain) 표시
 * - 좌우 스와이프 / 화살표로 이동, X·배경 탭·ESC로 닫기
 * - 핀치 줌, 더블탭 줌, 확대 상태에서 드래그 이동
 */
export default function GalleryLightbox({ images, index, onClose, onChange }: Props) {
    const isOpen = index !== null && images.length > 0;
    const total = images.length;

    // 확대/이동 상태
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);

    // 터치 추적용 (렌더와 무관하므로 ref)
    const touchRef = useRef({
        startX: 0, startY: 0,
        lastX: 0, lastY: 0,
        startDist: 0, startScale: 1,
        startOffset: { x: 0, y: 0 },
        lastTap: 0,
        pinching: false,
    });

    const resetZoom = useCallback(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    // 닫을 때 줌을 초기화해 두어 다음에 열 때 기본 배율로 시작
    const close = useCallback(() => {
        resetZoom();
        onClose();
    }, [onClose, resetZoom]);

    const go = useCallback((dir: 1 | -1) => {
        if (index === null || total <= 1) return;
        resetZoom();
        onChange((index + dir + total) % total);
    }, [index, total, onChange, resetZoom]);

    // 열려 있는 동안 바디 스크롤 잠금
    useEffect(() => {
        if (!isOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prevOverflow; };
    }, [isOpen]);

    // 키보드
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            else if (e.key === "ArrowLeft") go(-1);
            else if (e.key === "ArrowRight") go(1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, close, go]);

    const dist = (t: React.TouchList) =>
        Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onTouchStart = (e: React.TouchEvent) => {
        const t = touchRef.current;
        if (e.touches.length === 2) {
            t.pinching = true;
            t.startDist = dist(e.touches);
            t.startScale = scale;
            return;
        }
        const { clientX, clientY } = e.touches[0];
        t.startX = t.lastX = clientX;
        t.startY = t.lastY = clientY;
        t.startOffset = offset;
        t.pinching = false;
        setDragging(true);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        const t = touchRef.current;
        if (e.touches.length === 2 && t.pinching) {
            const next = Math.min(MAX_SCALE, Math.max(1, t.startScale * (dist(e.touches) / t.startDist)));
            setScale(next);
            if (next === 1) setOffset({ x: 0, y: 0 });
            return;
        }
        const { clientX, clientY } = e.touches[0];
        t.lastX = clientX;
        t.lastY = clientY;
        // 확대된 상태에서만 드래그로 이동
        if (scale > 1) {
            setOffset({
                x: t.startOffset.x + (clientX - t.startX),
                y: t.startOffset.y + (clientY - t.startY),
            });
        }
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        const t = touchRef.current;
        setDragging(false);
        if (t.pinching) {
            if (e.touches.length === 0) t.pinching = false;
            return;
        }
        const dx = t.lastX - t.startX;
        const dy = t.lastY - t.startY;
        const moved = Math.abs(dx) > 10 || Math.abs(dy) > 10;

        // 더블탭: 줌 토글
        if (!moved) {
            const now = Date.now();
            if (now - t.lastTap < 300) {
                if (scale > 1) resetZoom();
                else setScale(2);
                t.lastTap = 0;
            } else {
                t.lastTap = now;
            }
            return;
        }

        // 기본 배율에서 좌우 스와이프 → 이전/다음
        if (scale === 1 && Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            go(dx < 0 ? 1 : -1);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[110] bg-black flex items-center justify-center select-none"
                    style={{ touchAction: "none" }}
                    role="dialog" aria-modal="true" aria-label="사진 크게 보기"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* 사진 */}
                    <img
                        src={images[index!]}
                        alt={`갤러리 사진 ${index! + 1}`}
                        draggable={false}
                        className="max-w-full max-h-full object-contain"
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                            transition: dragging ? "none" : "transform 0.2s ease-out",
                        }}
                    />

                    {/* 상단 바: 카운터 + 닫기 */}
                    <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                        <span className="text-white/80 text-xs font-sans tracking-[0.2em]">
                            {index! + 1} / {total}
                        </span>
                        <button onClick={close} aria-label="닫기"
                                className="pointer-events-auto w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <X size={20}/>
                        </button>
                    </div>

                    {/* 좌우 이동 */}
                    {total > 1 && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="이전 사진"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                                <ChevronLeft size={22}/>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="다음 사진"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                                <ChevronRight size={22}/>
                            </button>
                        </>
                    )}

                    {/* 하단 안내 */}
                    <p className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] inset-x-0 text-center text-white/40 text-[10px] font-sans tracking-[0.2em] pointer-events-none">
                        두 손가락으로 확대 · 좌우로 넘기기
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
