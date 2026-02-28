"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Noto_Serif_KR } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone, Navigation, ChevronDown, ChevronUp, X,
    MessageSquare, Music, Share, Heart, ChevronLeft, ChevronRight, Plus
} from "lucide-react";
import { createGuestbookEntry, updateGuestbookEntry, deleteGuestbookEntry } from "@/app/actions";
import { useToast } from "@/components/ui/ToastProvider";
import { FlowerPetals, KenBurnsImage } from "@/components/effects";
import ReminderSection from "@/components/ReminderSection";

const serif = Noto_Serif_KR({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-serif"
});

declare global {
    interface Window {
        naver: any;
        Kakao: any;
    }
}

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};

interface GuestbookEntry {
    id: number;
    author_name: string;
    message: string;
    created_at: Date;
}

interface Type1Props {
    data: {
        groom: { name: string; contact: string; father: string; mother: string; father_contact?: string; mother_contact?: string };
        bride: { name: string; contact: string; father: string; mother: string; father_contact?: string; mother_contact?: string };
        date: Date;
        location: string;
        detail: string;
        address: string;
        location_lat: number | null;
        location_lng: number | null;
        message: string;
        mainImages: string[];
        middleImage: string;
        gallery: string[];
        transport: { subway: string; bus: string; parking: string };
        accounts: { side: string; bank: string; num: string; name: string }[];
        interviews: { q: string; a: string }[];
        guestbook: GuestbookEntry[];
        url_id: string;
    }
}

export default function Type1({ data }: Type1Props) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isInterviewOpen, setIsInterviewOpen] = useState(false);
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
    const [openAccount, setOpenAccount] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const [editTarget, setEditTarget] = useState<GuestbookEntry | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<GuestbookEntry | null>(null);

    // 슬라이드 상태
    const [currentMainIdx, setCurrentMainIdx] = useState(0);

    // 갤러리 상태
    const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);
    const [isGalleryPaused, setIsGalleryPaused] = useState(false);
    const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    const weddingDate = new Date(data.date);
    const weddingYear = weddingDate.getFullYear();
    const weddingMonth = weddingDate.getMonth();
    const weddingDay = weddingDate.getDate();
    const weddingDayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][weddingDate.getDay()];
    const firstDayOfMonth = new Date(weddingYear, weddingMonth, 1).getDay();
    const daysInMonth = new Date(weddingYear, weddingMonth + 1, 0).getDate();

    // [수정] 메인 슬라이드: 마지막 장에서 멈춤
    useEffect(() => {
        if (data.mainImages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentMainIdx((prev) => {
                // 마지막 사진이면 멈춤 (interval 해제)
                if (prev === data.mainImages.length - 1) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, 3000); // 3초 간격
        return () => clearInterval(timer);
    }, [data.mainImages]);

    // 갤러리 자동 슬라이드
    useEffect(() => {
        if (!isGalleryPaused && data.gallery.length > 1) {
            const timer = setInterval(() => {
                setCurrentGalleryIdx((prev) => (prev + 1) % data.gallery.length);
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [isGalleryPaused, data.gallery]);

    const nextGallery = () => {
        setIsGalleryPaused(true);
        setCurrentGalleryIdx((prev) => (prev + 1) % data.gallery.length);
    };
    const prevGallery = () => {
        setIsGalleryPaused(true);
        setCurrentGalleryIdx((prev) => (prev - 1 + data.gallery.length) % data.gallery.length);
    };
    const selectGallery = (idx: number) => {
        setIsGalleryPaused(true);
        setCurrentGalleryIdx(idx);
    };

    // 지도
    const initMap = () => {
        const lat = Number(data.location_lat);
        const lng = Number(data.location_lng);
        // 좌표 데이터가 없으면 실행 안 함
        if (!mapRef.current || !window.naver || isNaN(lat) || isNaN(lng) || lat === 0) {
            console.error("지도를 로드할 수 없는 좌표입니다.", lat, lng);
            return;
        }

        const mapOptions = {
            center: new window.naver.maps.LatLng(lat, lng),
            zoom: 16,
            zoomControl: false,
            scrollWheel: false,
        };

        const map = new window.naver.maps.Map(mapRef.current, mapOptions);
        new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(data.location_lat, data.location_lng),
            map: map,
        });
    };

    const shareKakao = () => {
        if (window.Kakao) {
            if (!window.Kakao.isInitialized()) window.Kakao.init("ea07c2afa5b5a0a07737bab48ab8e3e8");
            const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://wedding.binaryworld.kr";
            const imageUrl = data.mainImages[0] ? (data.mainImages[0].startsWith("http") ? data.mainImages[0] : `${baseUrl}${data.mainImages[0]}`) : "";
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `${data.groom.name} ♥ ${data.bride.name} 결혼합니다`,
                    description: `${weddingYear}년 ${weddingMonth + 1}월 ${weddingDay}일 ${data.location}`,
                    imageUrl,
                    link: { mobileWebUrl: window.location.href, webUrl: window.location.href },
                },
                buttons: [{ title: '청첩장 보기', link: { mobileWebUrl: window.location.href, webUrl: window.location.href } }],
            });
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const distance = weddingDate.getTime() - new Date().getTime();
            if (distance < 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [weddingDate]);

    useEffect(() => {
        const attemptPlay = async () => {
            if (audioRef.current && !isPlaying) {
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch (error) { console.log("Autoplay blocked"); }
            }
        };
        const handleInteraction = () => {
            attemptPlay();
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, []);

    const toggleMusic = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
            else { audioRef.current.play(); setIsPlaying(true); }
        }
    };

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        toast("복사되었습니다.");
    };

    const groomAccounts = data.accounts.filter(acc => acc.side === 'groom' || acc.side.startsWith('groom_'));
    const brideAccounts = data.accounts.filter(acc => acc.side === 'bride' || acc.side.startsWith('bride_'));

    return (
        <div className={`${serif.variable} font-sans bg-[#FAF8F6] min-h-screen flex justify-center selection:bg-rose-50`}>
            <Script strategy="afterInteractive" src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`} onLoad={initMap}/>
            <Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" onLoad={() => window.Kakao?.init("ea07c2afa5b5a0a07737bab48ab8e3e8")} />

            <div className="w-full max-w-[430px] bg-white shadow-2xl relative flex flex-col overflow-hidden">
                <FlowerPetals />
                <audio ref={audioRef} loop src="/music/sample1.mp3"/>

                {/* [수정] 음악 버튼: 헤더가 없으므로 top-8로 상단 배치 */}
                <div className="fixed top-8 right-[calc(50%-185px)] z-[90] max-[430px]:right-8">
                    <button onClick={toggleMusic} className="transition-transform active:scale-95">
                        <div
                            className={`relative flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md shadow-lg ${isPlaying ? "bg-white/40 ring-1 ring-rose-200" : "bg-black/10"}`}>
                            <Music size={18} className={isPlaying ? "text-rose-400 animate-pulse" : "text-white/80"}/>
                        </div>
                    </button>
                </div>

                {/* 1. 메인 섹션 */}
                <section className="relative h-[100vh] overflow-hidden">
                    <KenBurnsImage>
                        <AnimatePresence mode="wait">
                            {data.mainImages.length > 0 ? (
                                <motion.div
                                    key={currentMainIdx}
                                    initial={{opacity: 0, scale: 1.1}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0}}
                                    transition={{duration: 1.2}}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={data.mainImages[currentMainIdx]}
                                        alt="메인 웨딩 사진"
                                        fill
                                        className="object-cover brightness-95"
                                        priority
                                    />
                                </motion.div>
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">사진
                                    없음</div>
                            )}
                        </AnimatePresence>
                    </KenBurnsImage>

                    <div
                        className="absolute inset-0 flex flex-col items-center justify-between py-28 text-white text-center z-10">
                        <motion.div initial={{opacity: 0, y: 30}} animate={{opacity: 1, y: 0}}
                                    transition={{duration: 1.2}}>
                            <p className="text-[10px] tracking-[0.5em] font-medium opacity-90 uppercase bg-black/5 px-4 py-1.5 rounded-full backdrop-blur-[2px]">
                                The Day of Our Wedding
                            </p>
                            <h1 className="text-4xl font-serif mt-8 font-bold">
                                {data.groom.name} <span
                                className="font-light mx-1 opacity-70">&</span> {data.bride.name}
                            </h1>
                        </motion.div>
                        <motion.div className="font-serif" initial={{opacity: 0}} animate={{opacity: 1}}
                                    transition={{duration: 1.5, delay: 0.5}}>
                            <p className="text-xl tracking-widest uppercase">{weddingYear}. {weddingMonth + 1}. {weddingDay}.
                                SUN</p>
                            <p className="text-sm font-light opacity-80 mt-2">{data.location} {data.detail}</p>
                        </motion.div>
                    </div>
                </section>

                {/* 2. 초대글 */}
                <section className="py-28 px-10 text-center bg-white">
                    <FadeIn>
                        <Heart className="mx-auto text-rose-200 mb-10" size={26}/>
                        <h2 className="font-serif text-2xl mb-12 tracking-[0.15em] font-bold italic">초대합니다</h2>
                        <p className="font-serif text-[17px] leading-[2.3] text-gray-600 mb-16 whitespace-pre-wrap">
                            {data.message}
                        </p>
                    </FadeIn>

                    {data.middleImage && (
                        <FadeIn delay={0.2}>
                            <div
                                className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden mb-16 shadow-xl shadow-rose-50/50">
                                <Image src={data.middleImage} alt="서브 사진" fill className="object-cover"/>
                            </div>
                        </FadeIn>
                    )}

                    <FadeIn delay={0.3}>
                        <div className="space-y-6 text-gray-800 font-serif mb-12 text-lg">
                            <div><span className="text-gray-400 font-sans text-sm mr-3">신랑</span>
                                <b>{data.groom.name}</b> <span
                                    className="text-gray-300 mx-2">|</span> {data.groom.father} · {data.groom.mother}의
                                장남
                            </div>
                            <div><span className="text-gray-400 font-sans text-sm mr-3">신부</span>
                                <b>{data.bride.name}</b> <span
                                    className="text-gray-300 mx-2">|</span> {data.bride.father} · {data.bride.mother}의
                                차녀
                            </div>
                        </div>
                        <button onClick={() => setIsContactOpen(true)}
                                className="px-12 py-5 bg-[#FBF7F4] text-[#B19888] rounded-2xl font-bold text-sm flex items-center gap-3 mx-auto shadow-sm">
                            <Phone size={16}/> 연락처 보기
                        </button>
                    </FadeIn>
                </section>

                {/* 3. 달력 & 디데이 */}
                <section className="py-24 bg-[#FCFAF8] text-center border-y border-[#F3EFEA]">
                    <FadeIn>
                        <h3 className="font-serif text-2xl text-gray-800 italic font-bold">{weddingYear}년 {weddingMonth + 1}월 {weddingDay}일</h3>
                        <p className="font-serif text-rose-300 mt-2 font-bold tracking-widest text-sm uppercase">Sunday
                            12:30 PM</p>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <div className="max-w-[290px] mx-auto grid grid-cols-7 gap-y-5 text-sm my-12 px-2">
                            {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d}
                                                                               className={`font-bold text-[11px] ${d === '일' ? 'text-rose-400' : 'text-gray-300'}`}>{d}</div>)}
                            {Array.from({length: firstDayOfMonth}, (_, i) => (<div key={`empty-${i}`}/>))}
                            {Array.from({length: daysInMonth}, (_, i) => {
                                const day = i + 1;
                                const isWeddingDay = day === weddingDay;
                                return <div key={day}
                                            className={`py-1.5 flex items-center justify-center ${isWeddingDay ? 'bg-rose-400 text-white rounded-full font-bold scale-110' : 'text-gray-600 font-light'}`}>{day}</div>;
                            })}
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.3}>
                        <div className="flex justify-center items-center gap-5 text-gray-800">
                            <div className="flex flex-col items-center"><span
                                className="text-3xl font-serif tabular-nums">{String(timeLeft.days).padStart(2, '0')}</span><span
                                className="text-[9px] text-gray-400 mt-2 font-bold tracking-[0.2em] font-sans">DAYS</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-400 mb-6 opacity-70">:</span>
                            <div className="flex flex-col items-center"><span
                                className="text-3xl font-serif tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</span><span
                                className="text-[9px] text-gray-400 mt-2 font-bold tracking-[0.2em] font-sans">HOURS</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-400 mb-6 opacity-70">:</span>
                            <div className="flex flex-col items-center"><span
                                className="text-3xl font-serif tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</span><span
                                className="text-[9px] text-gray-400 mt-2 font-bold tracking-[0.2em] font-sans">MINS</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-400 mb-6 opacity-70">:</span>
                            <div className="flex flex-col items-center"><span
                                className="text-3xl font-serif tabular-nums">{String(timeLeft.seconds).padStart(2, '0')}</span><span
                                className="text-[9px] text-gray-400 mt-2 font-bold tracking-[0.2em] font-sans">SECS</span>
                            </div>
                        </div>
                        <p className="mt-10 text-center text-gray-500 font-serif text-[15px] animate-fade-in">
                            {data.groom.name}, {data.bride.name}의 결혼식이 <span
                            className="text-rose-400 font-bold text-lg mx-1">{timeLeft.days}</span>일 남았습니다.
                        </p>
                    </FadeIn>
                </section>

                {/* 4. 오시는 길 */}
                <section className="pt-24 pb-12 px-8 bg-white">
                    <FadeIn>
                        <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter underline underline-offset-8 decoration-gray-100 italic font-bold">오시는
                            길</h3>
                        <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Location</p>
                        <p className="text-center text-gray-800 font-bold text-lg mb-1">{data.location} {data.detail}</p>
                        <p className="text-center text-gray-400 text-[13px] mb-12 font-serif">{data.address}</p>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <div ref={mapRef} id="map"
                             className="w-full h-[350px] rounded-3xl bg-[#F9F9F9] mb-12 shadow-inner border border-gray-100 overflow-hidden"></div>
                        <div className="grid grid-cols-3 gap-3 mb-12">
                            <a href={`https://map.naver.com/v5/search/${encodeURIComponent(data.address)}`}
                               target="_blank" rel="noopener noreferrer"
                               className="flex flex-col items-center gap-2 py-4 bg-[#FBFBFB] rounded-2xl border border-gray-50 active:bg-gray-100 transition shadow-sm hover:bg-gray-50"><Navigation
                                size={18} className="text-[#03C75A]"/> <span
                                className="text-[11px] text-gray-500 font-bold">네이버 지도</span></a>
                            <a href={`https://map.kakao.com/link/search/${encodeURIComponent(data.address)}`}
                               target="_blank" rel="noopener noreferrer"
                               className="flex flex-col items-center gap-2 py-4 bg-[#FBFBFB] rounded-2xl border border-gray-50 active:bg-gray-100 transition shadow-sm hover:bg-gray-50"><Navigation
                                size={18} className="text-[#FEE500]"/> <span
                                className="text-[11px] text-gray-500 font-bold">카카오 내비</span></a>
                            <a href={`tmap://search?name=${encodeURIComponent(data.address)}`}
                               className="flex flex-col items-center gap-2 py-4 bg-[#FBFBFB] rounded-2xl border border-gray-50 active:bg-gray-100 transition shadow-sm hover:bg-gray-50"><Navigation
                                size={18} className="text-[#ED1C24]"/> <span
                                className="text-[11px] text-gray-500 font-bold">T맵</span></a>
                        </div>
                        <div className="space-y-8 text-[14px] border-t border-gray-50 pt-10 text-left">
                            {data.transport.subway && <div className="flex gap-4 sm:gap-5 min-w-0"><span
                                className="shrink-0 w-12 sm:w-14 h-7 bg-[#F3F4F6] text-[#4B5563] rounded-lg text-[10px] flex items-center justify-center font-bold whitespace-nowrap">지하철</span>
                                <p className="text-gray-500 font-light flex-1 min-w-0 leading-relaxed text-sm whitespace-pre-line break-words">{data.transport.subway}</p>
                            </div>}
                            {data.transport.bus && <div className="flex gap-4 sm:gap-5 min-w-0"><span
                                className="shrink-0 w-12 sm:w-14 h-7 bg-[#F3F4F6] text-[#4B5563] rounded-lg text-[10px] flex items-center justify-center font-bold whitespace-nowrap">버스</span>
                                <p className="text-gray-500 font-light flex-1 min-w-0 leading-relaxed text-sm whitespace-pre-line break-words">{data.transport.bus}</p>
                            </div>}
                            {data.transport.parking && <div className="flex gap-4 sm:gap-5 min-w-0"><span
                                className="shrink-0 w-12 sm:w-14 h-7 bg-[#F3F4F6] text-[#4B5563] rounded-lg text-[10px] flex items-center justify-center font-bold whitespace-nowrap">주차</span>
                                <p className="text-gray-500 font-light flex-1 min-w-0 leading-relaxed text-sm whitespace-pre-line break-words">{data.transport.parking}</p>
                            </div>}
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.15}>
                        <ReminderSection
                            groomName={data.groom.name}
                            brideName={data.bride.name}
                            date={weddingDate}
                            location={data.location}
                            address={data.address}
                            detail={data.detail}
                        />
                    </FadeIn>
                </section>

                {/* 5. 인터뷰 */}
                {data.interviews.length > 0 && (
                    <section className="py-24 px-10 bg-[#FAF9F7] text-center border-y border-[#F3EFEA]">
                        <FadeIn>
                            <Heart className="mx-auto text-rose-50 mb-8" size={24}/>
                            <h3 className="font-serif text-2xl text-gray-800 mb-2 italic">우리의 이야기</h3>
                            <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">The
                                Story</p>
                            <button onClick={() => setIsInterviewOpen(true)}
                                    className="px-12 py-5 bg-white text-[#A68F7F] rounded-[2rem] text-[15px] font-bold shadow-sm hover:shadow-md transition-all border border-rose-50 active:scale-95">인터뷰
                                보기
                            </button>
                        </FadeIn>
                    </section>
                )}

                {/* 6. 웨딩 갤러리 (뷰어 + 썸네일 복구) */}
                {data.gallery.length > 0 && (
                    <section className="py-24 bg-white">
                        <FadeIn>
                            <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter underline underline-offset-8 decoration-gray-100 italic font-bold">웨딩
                                갤러리</h3>
                            <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Gallery</p>
                        </FadeIn>

                        <div className="px-4 space-y-4">
                            {/* 메인 뷰어 */}
                            <FadeIn>
                                <div
                                    className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-lg bg-gray-100 group">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentGalleryIdx}
                                            initial={{opacity: 0}}
                                            animate={{opacity: 1}}
                                            exit={{opacity: 0}}
                                            transition={{duration: 0.5}}
                                            className="absolute inset-0"
                                        >
                                            <Image src={data.gallery[currentGalleryIdx]}
                                                   alt={`갤러리 사진 ${currentGalleryIdx + 1}`} fill
                                                   className="object-cover"/>
                                        </motion.div>
                                    </AnimatePresence>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        prevGallery();
                                    }}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/50 transition-colors">
                                        <ChevronLeft size={20}/></button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        nextGallery();
                                    }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/50 transition-colors">
                                        <ChevronRight size={20}/></button>
                                </div>
                            </FadeIn>

                            {/* 썸네일 리스트 */}
                            <FadeIn delay={0.2}>
                                <div className="grid grid-cols-4 gap-2">
                                    {data.gallery.slice(0, isGalleryExpanded ? undefined : 4).map((img, idx) => (
                                        <button key={idx} onClick={() => selectGallery(idx)}
                                                className={`relative aspect-square rounded-xl overflow-hidden shadow-sm transition-all ${currentGalleryIdx === idx ? 'ring-2 ring-rose-300 opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                                            <Image src={img} alt={`썸네일 ${idx + 1}`} fill className="object-cover"/>
                                        </button>
                                    ))}
                                </div>
                            </FadeIn>

                            {/* [복구] 더보기 버튼 (4장 초과 시 노출) */}
                            {data.gallery.length > 4 && (
                                <div className="pt-6 flex justify-center">
                                    <button onClick={() => setIsGalleryExpanded(!isGalleryExpanded)}
                                            className="text-gray-400 text-xs font-bold border-b border-gray-200 pb-1 flex items-center gap-1 hover:text-gray-600 transition-colors">
                                        {isGalleryExpanded ? "접기" : "사진 더보기"} {isGalleryExpanded ?
                                        <ChevronUp size={14}/> : <Plus size={14}/>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* 7. 마음 전하실 곳 (디자인 복구) */}
                <section className="py-24 px-8 bg-[#FBF9F7]">
                    <FadeIn>
                        <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter italic font-bold">마음
                            전하실 곳</h3>
                        <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Gift</p>
                    </FadeIn>
                    <div className="space-y-4">
                        {/* 신랑측 계좌 */}
                        {groomAccounts.length > 0 && (
                            <div
                                className="border border-rose-50 rounded-[2rem] overflow-hidden shadow-sm shadow-rose-50/20">
                                <button onClick={() => setOpenAccount(openAccount === 'groom' ? null : 'groom')}
                                        className={`w-full flex justify-between items-center p-7 transition-colors ${openAccount === 'groom' ? 'bg-rose-50/30 text-rose-400' : 'bg-white text-gray-700'}`}>
                                    <span className="font-serif font-bold">신랑측 계좌번호</span>{openAccount === 'groom' ?
                                    <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                </button>
                                {openAccount === 'groom' && (
                                    <div
                                        className="p-7 bg-white space-y-7 divide-y divide-gray-50 text-left animate-fade-in">
                                        {groomAccounts.map((acc, i) => (
                                            <div key={i} className="pt-6 first:pt-0 flex justify-between items-center">
                                                <div className="space-y-1">
                                                    {/* [수정] 관계 라벨 추가 (신랑, 혼주 등) */}
                                                    <span
                                                        className="text-[10px] text-rose-300 font-bold uppercase font-sans tracking-widest block">
                                                        {acc.side === 'groom' ? '신랑' : acc.side === 'groom_f' ? '혼주(부)' : '혼주(모)'}
                                                    </span>
                                                    <p className="text-[15px] font-bold text-gray-700">{acc.name}</p>
                                                    <p className="text-[12px] text-gray-400 font-sans tracking-tight">{acc.bank} {acc.num}</p>
                                                </div>
                                                <button onClick={() => copyText(acc.num)}
                                                        className="text-[11px] text-gray-400 bg-gray-50 px-4 py-2 rounded-full font-bold shadow-sm active:bg-gray-100 transition">복사
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 신부측 계좌 */}
                        {brideAccounts.length > 0 && (
                            <div
                                className="border border-rose-50 rounded-[2rem] overflow-hidden shadow-sm shadow-rose-50/20">
                                <button onClick={() => setOpenAccount(openAccount === 'bride' ? null : 'bride')}
                                        className={`w-full flex justify-between items-center p-7 transition-colors ${openAccount === 'bride' ? 'bg-rose-50/30 text-rose-400' : 'bg-white text-gray-700'}`}>
                                    <span className="font-serif font-bold">신부측 계좌번호</span>{openAccount === 'bride' ?
                                    <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                </button>
                                {openAccount === 'bride' && (
                                    <div
                                        className="p-7 bg-white space-y-7 divide-y divide-gray-50 text-left animate-fade-in">
                                        {brideAccounts.map((acc, i) => (
                                            <div key={i} className="pt-6 first:pt-0 flex justify-between items-center">
                                                <div className="space-y-1">
                                                    {/* [수정] 관계 라벨 추가 */}
                                                    <span
                                                        className="text-[10px] text-rose-300 font-bold uppercase font-sans tracking-widest block">
                                                        {acc.side === 'bride' ? '신부' : acc.side === 'bride_f' ? '혼주(부)' : '혼주(모)'}
                                                    </span>
                                                    <p className="text-[15px] font-bold text-gray-700">{acc.name}</p>
                                                    <p className="text-[12px] text-gray-400 font-sans tracking-tight">{acc.bank} {acc.num}</p>
                                                </div>
                                                <button onClick={() => copyText(acc.num)}
                                                        className="text-[11px] text-gray-400 bg-gray-50 px-4 py-2 rounded-full font-bold shadow-sm active:bg-gray-100 transition">복사
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* 8. 방명록 */}
                <section className="py-24 px-8 bg-white border-t border-gray-50">
                    <FadeIn>
                        <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter italic font-bold">방명록</h3>
                        <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Guestbook</p>
                    </FadeIn>
                    <div className="space-y-5 mb-12">
                        {(!data.guestbook || data.guestbook.length === 0) ? (
                            <div className="bg-[#FAF9F8] p-7 rounded-[2rem] shadow-sm text-center py-12 border border-gray-50">
                                <Heart size={24} className="mx-auto text-rose-200 fill-rose-100 mb-4" />
                                <p className="text-gray-400 text-sm leading-relaxed">아직 작성된 메시지가 없습니다.</p>
                                <p className="text-gray-400 text-sm mt-1">첫 번째 축하 글을 남겨주세요! 💌</p>
                            </div>
                        ) : (
                            <>
                                {data.guestbook.slice(0, visibleCount).map((g, idx) => (
                                    <FadeIn key={g.id} delay={idx * 0.05}>
                                        <div className="group/card bg-[#FAF9F8] p-7 rounded-[2rem] shadow-sm text-[15px] text-gray-600 leading-relaxed border border-gray-50 animate-fade-in text-left">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Heart size={10} className="text-rose-100 fill-rose-100 shrink-0" />
                                                    <span className="font-bold text-gray-400 text-[11px] font-sans uppercase tracking-tight">{g.author_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-gray-300 font-sans tracking-wider">
                                                        {new Date(g.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button type="button" onClick={() => setEditTarget(g)} className="text-[10px] text-gray-400 hover:text-rose-500 font-bold">수정</button>
                                                        <span className="text-gray-200">|</span>
                                                        <button type="button" onClick={() => setDeleteTarget(g)} className="text-[10px] text-gray-400 hover:text-rose-500 font-bold">삭제</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="whitespace-pre-line">{g.message}</p>
                                        </div>
                                    </FadeIn>
                                ))}
                            </>
                        )}
                    </div>
                    <FadeIn>
                        <div className="flex flex-col gap-4">
                            {data.guestbook && data.guestbook.length > 3 ? (
                                <div className="flex justify-center gap-6">
                                    {visibleCount < data.guestbook.length ? (
                                        <button onClick={() => setVisibleCount(data.guestbook.length)}
                                            className="py-4 text-gray-300 text-[11px] font-bold flex items-center gap-2 hover:text-gray-500 transition-colors uppercase tracking-[0.2em]">
                                            전체 보기 <ChevronDown size={14} />
                                        </button>
                                    ) : (
                                        <button onClick={() => setVisibleCount(3)}
                                            className="py-4 text-gray-300 text-[11px] font-bold flex items-center gap-2 hover:text-gray-500 transition-colors uppercase tracking-[0.2em]">
                                            접기 <ChevronUp size={14} />
                                        </button>
                                    )}
                                </div>
                            ) : null}
                            <button onClick={() => setIsWriteModalOpen(true)}
                                className="w-full py-5 border-2 border-[#E8E1D9] text-[#A68F7F] rounded-[1.8rem] font-bold text-[15px] bg-white shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                                <MessageSquare size={18} /> 축하 메시지 남기기
                            </button>
                        </div>
                    </FadeIn>
                </section>

                <section className="py-20 px-8 bg-[#FEE500]/5 text-center">
                    <button onClick={shareKakao}
                            className="w-full py-5 bg-[#FEE500] text-[#191919] rounded-[1.8rem] font-bold text-[15px] shadow-md flex items-center justify-center gap-3">
                        <Share size={18}/> 카카오톡으로 공유하기
                    </button>
                </section>

                <footer
                    className="py-20 bg-white text-center opacity-30 text-[9px] tracking-[0.6em] text-gray-400 font-light font-sans uppercase">Binary
                    Wedding Service
                </footer>

                {/* 모달들 (연락처, 인터뷰, 방명록) */}
                {isContactOpen &&
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in"
                         role="dialog" aria-modal="true">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                             onClick={() => setIsContactOpen(false)}/>
                        <div
                            className="bg-white w-full max-w-[380px] rounded-[3rem] p-10 relative z-10 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[85vh]">
                            <button onClick={() => setIsContactOpen(false)}
                                    className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition"><X/>
                            </button>
                            <h4 className="font-serif text-2xl mb-12 text-center text-gray-800 font-bold italic underline underline-offset-8 decoration-rose-50 italic">연락하기</h4>
                            <div className="space-y-12">
                                <div className="space-y-8"><p
                                    className="text-[12px] text-rose-300 font-bold font-sans uppercase tracking-[0.3em] border-b border-rose-50 pb-3 text-left">신랑측
                                    GROOM</p><ContactRow label="신랑" name={data.groom.name}
                                                         phone={data.groom.contact}/>{data.groom.father &&
                                    <ContactRow label="혼주(부)" name={data.groom.father}
                                                phone={data.groom.father_contact || ""}/>}{data.groom.mother &&
                                    <ContactRow label="혼주(모)" name={data.groom.mother}
                                                phone={data.groom.mother_contact || ""}/>}</div>
                                <div className="space-y-8"><p
                                    className="text-[12px] text-rose-300 font-bold font-sans uppercase tracking-[0.3em] border-b border-rose-50 pb-3 text-left">신부측
                                    BRIDE</p><ContactRow label="신부" name={data.bride.name}
                                                         phone={data.bride.contact}/>{data.bride.father &&
                                    <ContactRow label="혼주(부)" name={data.bride.father}
                                                phone={data.bride.father_contact || ""}/>}{data.bride.mother &&
                                    <ContactRow label="혼주(모)" name={data.bride.mother}
                                                phone={data.bride.mother_contact || ""}/>}</div>
                            </div>
                        </div>
                    </div>}
                {isInterviewOpen &&
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" role="dialog"
                         aria-modal="true">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                             onClick={() => setIsInterviewOpen(false)}/>
                        <div
                            className="bg-[#FCFAF9] w-full max-w-[360px] rounded-[3rem] p-10 relative z-10 max-h-[75vh] overflow-y-auto animate-fade-in-up shadow-2xl">
                            <button onClick={() => setIsInterviewOpen(false)}
                                    className="absolute top-10 right-10 text-gray-300 hover:text-gray-500 transition">
                                <X/></button>
                            <h4 className="font-serif text-2xl mb-14 text-center text-gray-800 font-bold italic underline underline-offset-8 decoration-rose-50 italic">The
                                Story</h4>
                            <div className="space-y-12 text-center text-gray-600">{data.interviews.map((iv, i) => (
                                <div key={i} className="space-y-5"><p
                                    className="text-[11px] text-rose-300 font-bold tracking-[0.2em] uppercase font-sans">Q. {iv.q}</p>
                                    <p className="font-serif text-base leading-[2.1] bg-white p-8 rounded-[2rem] shadow-sm italic border border-rose-50 whitespace-pre-line">"{iv.a}"</p>
                                </div>))}</div>
                        </div>
                    </div>}
                {editTarget && (
                    <GuestbookEditModal toast={toast}
                        entry={editTarget}
                        onClose={() => setEditTarget(null)}
                        onSuccess={() => { setEditTarget(null); router.refresh(); }}
                    />
                )}
                {deleteTarget && (
                    <GuestbookDeleteModal toast={toast}
                        entry={deleteTarget}
                        onClose={() => setDeleteTarget(null)}
                        onSuccess={() => { setDeleteTarget(null); router.refresh(); }}
                    />
                )}
                {isWriteModalOpen &&
                    <GuestbookModal toast={toast} url_id={data.url_id}
                        onClose={() => setIsWriteModalOpen(false)}
                        onSuccess={() => {
                            setIsWriteModalOpen(false);
                            router.refresh();
                        }}
                    />}
            </div>
        </div>
    );
}

function GuestbookModal({ toast, url_id, onClose, onSuccess }: { toast: (m: string) => Promise<void>; url_id: string; onClose: () => void; onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        const formData = new FormData(e.currentTarget);
        formData.set("author_name", (formData.get("author_name") as string) || "");
        formData.set("password", (formData.get("password") as string) || "");
        formData.set("message", (formData.get("message") as string) || "");
        const result = await createGuestbookEntry(url_id, formData);
        setIsSubmitting(false);
        if (result.success) {
            await toast(result.message);
            onSuccess();
        } else {
            setError(result.message || "등록에 실패했습니다.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] p-10 relative z-10 animate-fade-in-up shadow-2xl border border-rose-50">
                <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition"><X /></button>
                <div className="text-center mb-10 text-gray-800">
                    <MessageSquare className="mx-auto text-rose-100 mb-4" size={36} />
                    <h4 className="font-serif text-xl font-bold italic underline underline-offset-8 decoration-rose-50">축하 메시지 작성</h4>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-2">
                        <label htmlFor="writerName" className="text-[13px] font-bold text-gray-800 ml-1">성함</label>
                        <input id="writerName" name="author_name" type="text" placeholder="성함을 입력해주세요" required maxLength={50}
                            className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all text-gray-900 font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="writerPw" className="text-[13px] font-bold text-gray-800 ml-1">비밀번호</label>
                        <input id="writerPw" name="password" type="password" placeholder="비밀번호 입력 (수정/삭제 시 필요)" required minLength={4} maxLength={20}
                            className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all text-gray-900" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="writerMsg" className="text-[13px] font-bold text-gray-800 ml-1">메시지</label>
                        <textarea id="writerMsg" name="message" rows={4} placeholder="소중한 축하의 마음을 남겨주세요" required maxLength={500}
                            className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all resize-none text-gray-900 leading-relaxed" />
                    </div>
                    {error && <p className="text-rose-500 text-sm font-bold">{error}</p>}
                    <button type="submit" disabled={isSubmitting}
                        className="w-full py-5 bg-[#B19888] text-white rounded-[1.5rem] font-bold text-[15px] shadow-lg shadow-rose-50/50 active:scale-[0.98] transition-all mt-4 disabled:opacity-70">
                        {isSubmitting ? "등록 중..." : "등록하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function GuestbookEditModal({ toast, entry, onClose, onSuccess }: { toast: (m: string) => Promise<void>; entry: GuestbookEntry; onClose: () => void; onSuccess: () => void }) {
    const [author_name, setAuthorName] = useState(entry.author_name);
    const [message, setMessage] = useState(entry.message);
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) { setError("비밀번호를 입력해 주세요."); return; }
        setIsSubmitting(true);
        setError("");
        const result = await updateGuestbookEntry(entry.id, password, author_name, message);
        setIsSubmitting(false);
        if (result.success) {
            await toast(result.message);
            onSuccess();
        } else {
            setError(result.message || "수정에 실패했습니다.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] p-10 relative z-10 animate-fade-in-up shadow-2xl border border-rose-50">
                <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition"><X /></button>
                <div className="text-center mb-10 text-gray-800">
                    <h4 className="font-serif text-xl font-bold italic underline underline-offset-8 decoration-rose-50">방명록 수정</h4>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-800 ml-1">성함</label>
                        <input type="text" value={author_name} onChange={(e) => setAuthorName(e.target.value)} required maxLength={50}
                            className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all text-gray-900 font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-800 ml-1">메시지</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required maxLength={500}
                            className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all resize-none text-gray-900 leading-relaxed" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-800 ml-1">비밀번호</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="작성 시 입력한 비밀번호" required minLength={4} maxLength={20}
                            className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all text-gray-900" />
                    </div>
                    {error && <p className="text-rose-500 text-sm font-bold">{error}</p>}
                    <button type="submit" disabled={isSubmitting}
                        className="w-full py-5 bg-[#B19888] text-white rounded-[1.5rem] font-bold text-[15px] shadow-lg shadow-rose-50/50 active:scale-[0.98] transition-all mt-4 disabled:opacity-70">
                        {isSubmitting ? "수정 중..." : "수정하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function GuestbookDeleteModal({ toast, entry, onClose, onSuccess }: { toast: (m: string) => Promise<void>; entry: GuestbookEntry; onClose: () => void; onSuccess: () => void }) {
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) { setError("비밀번호를 입력해 주세요."); return; }
        setIsSubmitting(true);
        setError("");
        const result = await deleteGuestbookEntry(entry.id, password);
        setIsSubmitting(false);
        if (result.success) {
            await toast(result.message);
            onSuccess();
        } else {
            setError(result.message || "삭제에 실패했습니다.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] p-10 relative z-10 animate-fade-in-up shadow-2xl border border-rose-50">
                <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition"><X /></button>
                <div className="text-center mb-10 text-gray-800">
                    <h4 className="font-serif text-xl font-bold italic underline underline-offset-8 decoration-rose-50">방명록 삭제</h4>
                    <p className="text-sm text-gray-500 mt-4 line-clamp-2">"{entry.message.slice(0, 50)}{entry.message.length > 50 ? "..." : ""}"</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-800 ml-1">비밀번호</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="작성 시 입력한 비밀번호" required minLength={4} maxLength={20}
                            className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all text-gray-900" />
                    </div>
                    {error && <p className="text-rose-500 text-sm font-bold">{error}</p>}
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-5 border border-gray-200 text-gray-600 rounded-[1.5rem] font-bold text-[15px] hover:bg-gray-50 transition">
                            취소
                        </button>
                        <button type="submit" disabled={isSubmitting}
                            className="flex-1 py-5 bg-rose-500 text-white rounded-[1.5rem] font-bold text-[15px] shadow-lg active:scale-[0.98] transition-all disabled:opacity-70">
                            {isSubmitting ? "삭제 중..." : "삭제하기"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ContactRow({label, name, phone}: { label: string, name: string, phone: string }) {
    if (!phone) return null;
    return (
        <div className="flex justify-between items-center group">
            <span className="text-base font-bold text-gray-700">{label} {name}</span>
            <div className="flex gap-4">
                <a href={`tel:${phone}`}
                   className="w-10 h-10 bg-[#FDFBF9] border border-rose-50 rounded-full flex items-center justify-center text-rose-300 hover:bg-rose-50 transition"><Phone
                    size={18}/></a>
                <a href={`sms:${phone}`}
                   className="w-10 h-10 bg-[#FDFBF9] border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition"><MessageSquare
                    size={18}/></a>
            </div>
        </div>
    );
}