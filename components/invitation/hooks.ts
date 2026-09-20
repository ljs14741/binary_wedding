"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

/** 예식일 파생값 (연/월/일, 영문 요일·시간, 달력 그리기용 값) */
export function useWeddingDate(date: Date | string) {
    return useMemo(() => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth();
        const day = d.getDate();
        return {
            date: d,
            year,
            month,
            day,
            weekdayShortEn: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
            weekdayLongEn: d.toLocaleDateString("en-US", { weekday: "long" }),
            timeEn: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase(),
            firstDayOfMonth: new Date(year, month, 1).getDay(),
            daysInMonth: new Date(year, month + 1, 0).getDate(),
        };
    }, [date]);
}

/** 예식일까지 남은 시간. 지나면 0으로 고정 */
export function useCountdown(target: Date) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const targetMs = target.getTime();

    useEffect(() => {
        const tick = () => {
            const distance = targetMs - Date.now();
            if (distance < 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }
            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        };
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [targetMs]);

    return timeLeft;
}

/** 배경음악: 첫 터치/클릭 시 자동재생 시도, 토글 버튼용 상태 */
export function useBgm() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const attemptPlay = async () => {
            if (audioRef.current && audioRef.current.paused) {
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch {
                    // 브라우저 자동재생 차단 — 사용자가 버튼으로 켤 수 있음
                }
            }
        };
        const handleInteraction = () => {
            attemptPlay();
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("touchstart", handleInteraction);
        };
        window.addEventListener("click", handleInteraction);
        window.addEventListener("touchstart", handleInteraction);
        return () => {
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("touchstart", handleInteraction);
        };
    }, []);

    const toggle = (e?: MouseEvent) => {
        e?.stopPropagation();
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    return { audioRef, isPlaying, toggle };
}

/** 메인 슬라이드: 3초 간격으로 넘어가다 마지막 장에서 멈춤 */
export function useMainSlide(count: number, intervalMs = 3000) {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        if (count <= 1) return;
        const timer = setInterval(() => {
            setIdx((prev) => {
                if (prev >= count - 1) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, intervalMs);
        return () => clearInterval(timer);
    }, [count, intervalMs]);
    return idx;
}

/** 갤러리 뷰어: 자동 슬라이드(사용자 조작 시 정지), 썸네일 선택, 라이트박스 */
export function useGallery(count: number, intervalMs = 3000) {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

    useEffect(() => {
        if (paused || count <= 1) return;
        const timer = setInterval(() => setCurrent((prev) => (prev + 1) % count), intervalMs);
        return () => clearInterval(timer);
    }, [paused, count, intervalMs]);

    const next = () => { setPaused(true); setCurrent((prev) => (prev + 1) % count); };
    const prev = () => { setPaused(true); setCurrent((prev) => (prev - 1 + count) % count); };
    const select = (i: number) => { setPaused(true); setCurrent(i); };
    const openLightbox = (i: number) => { setPaused(true); setCurrent(i); setLightboxIdx(i); };
    const closeLightbox = () => setLightboxIdx(null);
    const changeLightbox = (i: number) => { setLightboxIdx(i); setCurrent(i); };

    return {
        current, expanded, setExpanded, lightboxIdx,
        next, prev, select, openLightbox, closeLightbox, changeLightbox,
    };
}
