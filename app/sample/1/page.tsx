"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import Image from "next/image";
import Script from "next/script";
import { Noto_Serif_KR } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone, Copy, MapPin, Heart, Pause, Play,
    Navigation, ChevronDown, ChevronUp, X,
    MessageSquare, Plus, Mail,
    Music, Share, ChevronLeft, ChevronRight
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
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

const getLastSundayOfDecember = () => {
    const now = new Date();
    const year = now.getFullYear();
    const dec31 = new Date(year, 11, 31);
    const day = dec31.getDay();
    const lastSunday = new Date(year, 11, 31 - day);

    if (lastSunday < now) {
        const nextYear = year + 1;
        const nextDec31 = new Date(nextYear, 11, 31);
        const nextDay = nextDec31.getDay();
        const nextLastSunday = new Date(nextYear, 11, 31 - nextDay);
        nextLastSunday.setHours(12, 30, 0, 0);
        return nextLastSunday;
    }

    lastSunday.setHours(12, 30, 0, 0);
    return lastSunday;
};

const DATA = {
    groom: {
        name: "이진호", phone: "010-1234-5678", email: "jinho@example.com",
        father: { name: "이정훈", phone: "010-1111-2222", bank: "국민 110-123-4567" },
        mother: { name: "김현숙", phone: "010-3333-4444", bank: "신한 110-987-6543" },
        bank: "국민 123-456-7890"
    },
    bride: {
        name: "박나은", phone: "010-9876-5432", email: "naeun@example.com",
        father: { name: "박서준", phone: "010-5555-6666", bank: "우리 1002-111-2222" },
        mother: { name: "최영희", phone: "010-7777-8888", bank: "하나 123-456-789" },
        bank: "우리 1002-333-4444"
    },
    date: getLastSundayOfDecember(),
    location: "더채플앳청담 커티지홀",
    detailLocation: "3층",
    address: "서울 강남구 선릉로 757",
    lat: 37.5225,
    lng: 127.0392,
    mainImages: ["/images/main1.png", "/images/main2.png", "/images/main3.png"],
    middleImage: "/images/middle1.png",
    galleryImages: ["/images/gallary1.png", "/images/gallary2.png", "/images/gallary3.png", "/images/gallary4.png"],
    guestbook: [
        { id: 1, author: "친구 김지수", msg: "나은아 결혼 너무 축하해! ❤️ 우리 꽃길만 걷자!", date: "2026.01.15" },
        { id: 2, author: "동료 박성진", msg: "두 분 모습이 너무 아름답네요. 축복합니다! 👋", date: "2026.01.16" },
        { id: 3, author: "사촌 동생", msg: "형부! 우리 언니 잘 부탁드려요! 💖", date: "2026.01.18" },
        { id: 4, author: "대학 선배", msg: "멋진 신랑 진호야, 행복하게 잘 살아라! ✨", date: "2026.01.20" },
        { id: 5, author: "이웃집 이모", msg: "어머 두 사람 정말 잘 어울린다! 행복해!", date: "2026.01.21" }
    ]
};

export default function PremiumSample1() {
    const { toast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isInterviewOpen, setIsInterviewOpen] = useState(false);
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
    const [openAccount, setOpenAccount] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(3);

    // 메인 슬라이드 상태
    const [currentMainIdx, setCurrentMainIdx] = useState(0);

    // 갤러리 관련 상태
    const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);
    const [isGalleryPaused, setIsGalleryPaused] = useState(false);
    const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    const weddingYear = DATA.date.getFullYear();
    const weddingMonth = DATA.date.getMonth();
    const firstDayOfMonth = new Date(weddingYear, weddingMonth, 1).getDay();
    const daysInMonth = new Date(weddingYear, weddingMonth + 1, 0).getDate();

    // [수정] 메인 이미지 슬라이드 속도 통일 (3초 간격)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentMainIdx((prev) => {
                if (prev === DATA.mainImages.length - 1) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, 3000); // 3초마다 변경
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!isGalleryPaused) {
            const timer = setInterval(() => {
                setCurrentGalleryIdx((prev) => (prev + 1) % DATA.galleryImages.length);
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [isGalleryPaused]);

    const nextGallery = () => {
        setIsGalleryPaused(true);
        setCurrentGalleryIdx((prev) => (prev + 1) % DATA.galleryImages.length);
    };

    const prevGallery = () => {
        setIsGalleryPaused(true);
        setCurrentGalleryIdx((prev) => (prev - 1 + DATA.galleryImages.length) % DATA.galleryImages.length);
    };

    const selectGallery = (idx: number) => {
        setIsGalleryPaused(true);
        setCurrentGalleryIdx(idx);
    };

    const shareKakao = () => {
        toast("샘플 화면에서는 카카오톡 공유를 사용할 수 없습니다.");
    };

    const initMap = () => {
        if (!mapRef.current || !window.naver) return;
        const map = new window.naver.maps.Map(mapRef.current, {
            center: new window.naver.maps.LatLng(DATA.lat, DATA.lng),
            zoom: 16,
            zoomControl: false,
            scrollWheel: true,
        });
        new window.naver.maps.Marker({ position: new window.naver.maps.LatLng(DATA.lat, DATA.lng), map });
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const distance = DATA.date.getTime() - new Date().getTime();
            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const attemptPlay = async () => {
            if (audioRef.current && !isPlaying) {
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch (error) {
                    console.log("Autoplay blocked");
                }
            }
        };
        attemptPlay();
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

    return (
        <div className={`${serif.variable} font-sans bg-[#FAF8F6] min-h-screen flex flex-col selection:bg-rose-50`}>
            <title>{`${DATA.groom.name} & ${DATA.bride.name} 결혼합니다`}</title>
            <meta name="description" content={`${weddingYear}년 ${weddingMonth + 1}월 ${DATA.date.getDate()}일, 저희 결혼식에 초대합니다.`} />
            <meta property="og:title" content={`${DATA.groom.name} & ${DATA.bride.name}의 모바일 청첩장`} />
            <meta property="og:description" content={`${weddingYear}년 ${weddingMonth + 1}월 ${DATA.date.getDate()}일 ${DATA.location}`} />
            <meta property="og:image" content={DATA.mainImages[0]} />
            <meta property="og:type" content="website" />

            <Script strategy="afterInteractive" src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`} onLoad={initMap}/>
            <Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" onLoad={() => {
                if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init("ea07c2afa5b5a0a07737bab48ab8e3e8");
            }} />

            <SiteHeader />

            <div className="flex-1 flex justify-center pt-28 pb-20">
                <div className="w-full max-w-[430px] bg-white shadow-2xl relative flex flex-col overflow-hidden">
                    <FlowerPetals />
                    <audio ref={audioRef} loop src="/music/sample1.mp3"/>

                    {/* [수정] 음악 버튼: top-24 -> top-36으로 더 내려서 배치 */}
                    <div className="fixed top-36 right-[calc(50%-185px)] z-[90] max-[430px]:right-8">
                        <button onClick={toggleMusic} className="transition-transform active:scale-95">
                            <div
                                className={`relative flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md shadow-lg ${isPlaying ? "bg-white/40 ring-1 ring-rose-200" : "bg-black/10"}`}>
                                <Music size={18}
                                       className={isPlaying ? "text-rose-400 animate-pulse" : "text-white/80"}/>
                            </div>
                        </button>
                    </div>

                    {/* 메인 섹션 */}
                    <section className="relative h-[100vh] overflow-hidden">
                        <KenBurnsImage>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentMainIdx}
                                    initial={{opacity: 0, scale: 1.1}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0}}
                                    transition={{duration: 1.2}}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={DATA.mainImages[currentMainIdx]}
                                        alt="메인 사진"
                                        fill
                                        className="object-cover brightness-95"
                                        priority
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </KenBurnsImage>

                        <div className="absolute inset-0 flex flex-col items-center justify-between py-28 text-white text-center z-10">
                            <motion.div initial={{opacity: 0, y: 30}} animate={{opacity: 1, y: 0}}
                                        transition={{duration: 1.2}}>
                                <p className="text-[10px] tracking-[0.5em] font-medium opacity-90 uppercase bg-black/5 px-4 py-1.5 rounded-full backdrop-blur-[2px]">
                                    The Day of Our Wedding
                                </p>
                                <h1 className="text-4xl font-serif mt-8 font-bold">
                                    {DATA.groom.name} <span className="font-light mx-1 opacity-70">&</span> {DATA.bride.name}
                                </h1>
                            </motion.div>
                            <div className="font-serif">
                                <p className="text-xl tracking-widest uppercase">{weddingYear}. {weddingMonth + 1}. {DATA.date.getDate()}.
                                    SUN</p>
                                <p className="text-sm font-light opacity-80 mt-2">{DATA.location} {DATA.detailLocation}</p>
                            </div>
                        </div>
                    </section>

                    {/* 초대문구 섹션 */}
                    <section className="py-28 px-10 text-center bg-white">
                        <FadeIn>
                            <Heart className="mx-auto text-rose-200 mb-10" size={26}/>
                            <h2 className="font-serif text-2xl mb-12 tracking-[0.15em] font-bold italic">초대합니다</h2>
                            <p className="font-serif text-[17px] leading-[2.3] text-gray-600 mb-16">
                                서로가 마주 보며 다진 약속을<br/>
                                이제 여러분 앞에서 소중히 맺으려 합니다.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <div
                                className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden mb-16 shadow-xl shadow-rose-50/50">
                                <Image src={DATA.middleImage} alt="신랑 신부" fill className="object-cover"/>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <div className="space-y-6 text-gray-800 font-serif mb-12 text-lg">
                                <div><span className="text-gray-400 font-sans text-sm mr-3">신랑</span>
                                    <b>{DATA.groom.name}</b> <span
                                        className="text-gray-300 mx-2">|</span> {DATA.groom.father.name} · {DATA.groom.mother.name}의
                                    장남
                                </div>
                                <div><span className="text-gray-400 font-sans text-sm mr-3">신부</span>
                                    <b>{DATA.bride.name}</b> <span
                                        className="text-gray-300 mx-2">|</span> {DATA.bride.father.name} · {DATA.bride.mother.name}의
                                    차녀
                                </div>
                            </div>
                            <button onClick={() => setIsContactOpen(true)}
                                    className="px-12 py-5 bg-[#FBF7F4] text-[#B19888] rounded-2xl font-bold text-sm flex items-center gap-3 mx-auto shadow-sm">
                                <Phone size={16}/> 연락처 보기
                            </button>
                        </FadeIn>
                    </section>

                    {/* [복구] 달력 섹션 (위치: 초대문구 다음) */}
                    <section className="py-24 bg-[#FCFAF8] text-center border-y border-[#F3EFEA]">
                        <FadeIn>
                            <h3 className="font-serif text-2xl text-gray-800 italic font-bold">{weddingYear}년 {weddingMonth + 1}월 {DATA.date.getDate()}일</h3>
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
                                    const isWeddingDay = day === DATA.date.getDate();
                                    return (
                                        <div key={day}
                                             className={`py-1.5 flex items-center justify-center ${isWeddingDay ? 'bg-rose-400 text-white rounded-full font-bold scale-110' : 'text-gray-600 font-light'}`}>
                                            {day}
                                        </div>
                                    );
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
                        </FadeIn>
                        <p className="mt-10 text-center text-gray-500 font-serif text-[15px] animate-fade-in">
                            {DATA.groom.name}, {DATA.bride.name}의 결혼식이 <span
                            className="text-rose-400 font-bold text-lg mx-1">{timeLeft.days}</span>일 남았습니다.
                        </p>
                    </section>

                    {/* [복구] 지도 섹션 (위치: 달력 다음) */}
                    <section className="pt-24 pb-12 px-8 bg-white">
                        <FadeIn>
                            <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter underline underline-offset-8 decoration-gray-100 italic font-bold">오시는 길</h3>
                            <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Location</p>
                            <p className="text-center text-gray-800 font-bold text-lg mb-1">{DATA.location} {DATA.detailLocation}</p>
                            <p className="text-center text-gray-400 text-[13px] mb-12 font-serif">{DATA.address}</p>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <div ref={mapRef} id="map"
                                 className="w-full h-[350px] rounded-3xl bg-[#F9F9F9] mb-12 shadow-inner border border-gray-100 overflow-hidden"></div>

                            <div className="grid grid-cols-3 gap-3 mb-12">
                                <a href={`https://map.naver.com/v5/search/${encodeURIComponent(DATA.address)}`}
                                   target="_blank" rel="noopener noreferrer"
                                   className="flex flex-col items-center gap-2 py-4 bg-[#FBFBFB] rounded-2xl border border-gray-50 active:bg-gray-100 transition shadow-sm hover:bg-gray-50">
                                    <Navigation size={18} className="text-[#03C75A]"/>
                                    <span className="text-[11px] text-gray-500 font-bold">네이버 지도</span>
                                </a>
                                <a href={`https://map.kakao.com/link/to/${encodeURIComponent(DATA.location)},${DATA.lat},${DATA.lng}`}
                                   target="_blank" rel="noopener noreferrer"
                                   className="flex flex-col items-center gap-2 py-4 bg-[#FBFBFB] rounded-2xl border border-gray-50 active:bg-gray-100 transition shadow-sm hover:bg-gray-50">
                                    <Navigation size={18} className="text-[#FEE500]"/>
                                    <span className="text-[11px] text-gray-500 font-bold">카카오 내비</span>
                                </a>
                                <a href={`tmap://search?name=${encodeURIComponent(DATA.address)}`}
                                   className="flex flex-col items-center gap-2 py-4 bg-[#FBFBFB] rounded-2xl border border-gray-50 active:bg-gray-100 transition shadow-sm hover:bg-gray-50">
                                    <Navigation size={18} className="text-[#ED1C24]"/>
                                    <span className="text-[11px] text-gray-500 font-bold">T맵</span>
                                </a>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <div className="space-y-8 text-[14px] border-t border-gray-50 pt-10 text-left">
                                <div className="flex gap-5">
                                    <span
                                        className="shrink-0 w-14 h-7 bg-[#F3F4F6] text-[#4B5563] rounded-lg text-[10px] flex items-center justify-center font-bold whitespace-nowrap">지하철</span>
                                    <p className="text-gray-500 font-light flex-1 leading-relaxed text-sm">7호선, 수인분당선 <b
                                        className="font-bold text-gray-800">강남구청역</b> 3-1번 출구에서 500m (도보 8분)</p>
                                </div>
                                <div className="flex gap-5">
                                    <span
                                        className="shrink-0 w-14 h-7 bg-[#F3F4F6] text-[#4B5563] rounded-lg text-[10px] flex items-center justify-center font-bold whitespace-nowrap">버스</span>
                                    <p className="text-gray-500 font-light flex-1 leading-relaxed text-sm"><b
                                        className="font-bold text-gray-800">강남구청, 강남세무서</b> 정류장 하차<br/>간선: 301, 342, 472
                                        / 지선: 3011, 4412</p>
                                </div>
                                <div className="flex gap-5">
                                    <span
                                        className="shrink-0 w-14 h-7 bg-[#F3F4F6] text-[#4B5563] rounded-lg text-[10px] flex items-center justify-center font-bold whitespace-nowrap">주차</span>
                                    <p className="text-gray-500 font-light flex-1 leading-relaxed text-sm font-medium italic">웨딩홀
                                        내 200대 주차 가능 <span className="text-rose-400 font-bold">(2시간 무료)</span></p>
                                </div>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.15}>
                            <ReminderSection
                                groomName={DATA.groom.name}
                                brideName={DATA.bride.name}
                                date={DATA.date}
                                location={DATA.location}
                                address={DATA.address}
                                detail={DATA.detailLocation}
                                isSample
                            />
                        </FadeIn>
                    </section>

                    <section className="py-24 px-10 bg-[#FAF9F7] text-center border-y border-[#F3EFEA]">
                        <FadeIn>
                            <Heart className="mx-auto text-rose-50 mb-8" size={24}/>
                            <h3 className="font-serif text-2xl text-gray-800 mb-2 italic">우리의 이야기</h3>
                            <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">The Story</p>
                            <button
                                onClick={() => setIsInterviewOpen(true)}
                                aria-label="신랑신부 인터뷰 보기"
                                className="px-12 py-5 bg-white text-[#A68F7F] rounded-[2rem] text-[15px] font-bold shadow-sm hover:shadow-md transition-all border border-rose-50 active:scale-95"
                            >
                                인터뷰 보기
                            </button>
                        </FadeIn>
                    </section>

                    <section className="py-24 bg-white">
                        <FadeIn>
                            <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter underline underline-offset-8 decoration-gray-100 italic font-bold">웨딩 갤러리</h3>
                            <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Gallery</p>
                        </FadeIn>

                        <div className="px-4 space-y-4">
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
                                            <Image
                                                src={DATA.galleryImages[currentGalleryIdx]}
                                                alt={`갤러리 사진 ${currentGalleryIdx + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </motion.div>
                                    </AnimatePresence>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prevGallery();
                                        }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/50 transition-colors"
                                    >
                                        <ChevronLeft size={20}/>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextGallery();
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/50 transition-colors"
                                    >
                                        <ChevronRight size={20}/>
                                    </button>
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <div className="grid grid-cols-4 gap-2">
                                    {DATA.galleryImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => selectGallery(idx)}
                                            className={`relative aspect-square rounded-xl overflow-hidden shadow-sm transition-all ${
                                                currentGalleryIdx === idx ? 'ring-2 ring-rose-300 opacity-100' : 'opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <Image src={img} alt={`썸네일 ${idx + 1}`} fill className="object-cover"/>
                                        </button>
                                    ))}
                                </div>
                            </FadeIn>

                            {isGalleryExpanded && (
                                <motion.div
                                    initial={{opacity: 0, height: 0}}
                                    animate={{opacity: 1, height: "auto"}}
                                    className="grid grid-cols-4 gap-2 mt-2"
                                >
                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center text-[10px] text-gray-300">More 1</div>
                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center text-[10px] text-gray-300">More 2</div>
                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center text-[10px] text-gray-300">More 3</div>
                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center text-[10px] text-gray-300">More 4</div>
                                </motion.div>
                            )}

                            <div className="pt-6 flex justify-center">
                                <button
                                    onClick={() => setIsGalleryExpanded(!isGalleryExpanded)}
                                    className="text-gray-400 text-xs font-bold border-b border-gray-200 pb-1 flex items-center gap-1 hover:text-gray-600 transition-colors"
                                >
                                    {isGalleryExpanded ? "접기" : "사진 더보기"} {isGalleryExpanded ? <ChevronUp size={14}/> : <Plus size={14}/>}
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="py-24 px-8 bg-[#FBF9F7]">
                        <FadeIn>
                            <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter italic font-bold">마음 전하실 곳</h3>
                            <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Gift</p>
                        </FadeIn>
                        <div className="space-y-4">
                            {(['groom', 'bride'] as const).map((side, idx) => (
                                <FadeIn key={side} delay={idx * 0.1}>
                                    <div
                                        className="border border-rose-50 rounded-[2rem] overflow-hidden shadow-sm shadow-rose-50/20">
                                        <button
                                            onClick={() => setOpenAccount(openAccount === side ? null : side)}
                                            className={`w-full flex justify-between items-center p-7 transition-colors ${openAccount === side ? 'bg-rose-50/30 text-rose-400' : 'bg-white text-gray-700'}`}
                                        >
                                            <span className="font-serif font-bold">{side === 'groom' ? '신랑측' : '신부측'} 계좌번호</span>
                                            {openAccount === side ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                        </button>
                                        {openAccount === side && (
                                            <div className="p-7 bg-white space-y-7 divide-y divide-gray-50 animate-fade-in text-left">
                                                {[
                                                    { role: side === 'groom' ? '신랑' : '신부', name: DATA[side].name, bank: DATA[side].bank },
                                                    { role: '혼주(부)', name: DATA[side].father.name, bank: DATA[side].father.bank },
                                                    { role: '혼주(모)', name: DATA[side].mother.name, bank: DATA[side].mother.bank }
                                                ].map((a, i) => (
                                                    <div key={i} className="pt-6 first:pt-0 flex justify-between items-center">
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] text-rose-300 font-bold uppercase font-sans tracking-widest">{a.role}</span>
                                                            <p className="text-[15px] font-bold text-gray-700">{a.name}</p>
                                                            <p className="text-[12px] text-gray-400 font-sans tracking-tight">{a.bank}</p>
                                                        </div>
                                                        <button onClick={() => copyText(a.bank)}
                                                                className="text-[11px] text-gray-400 bg-gray-50 px-4 py-2 rounded-full font-bold shadow-sm active:bg-gray-100 transition">복사
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </section>

                    <section className="py-24 px-8 bg-white border-t border-gray-50">
                        <FadeIn>
                            <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter italic font-bold">방명록</h3>
                            <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Guestbook</p>
                        </FadeIn>
                        <div className="space-y-5 mb-12">
                            {DATA.guestbook.slice(0, visibleCount).map((g, idx) => (
                                <FadeIn key={g.id} delay={idx * 0.05}>
                                    <div className="bg-[#FAF9F8] p-7 rounded-[2rem] shadow-sm text-[15px] text-gray-600 leading-relaxed border border-gray-50 animate-fade-in text-left">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2"><Heart size={10} className="text-rose-100 fill-rose-100"/><span
                                                className="font-bold text-gray-400 text-[11px] font-sans uppercase tracking-tight">{g.author}</span>
                                            </div>
                                            <span className="text-[9px] text-gray-300 font-sans tracking-wider">{g.date}</span>
                                        </div>
                                        {g.msg}
                                    </div>
                                </FadeIn>
                            ))}
                        </div>

                        <FadeIn>
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-center gap-6">
                                    {visibleCount < DATA.guestbook.length ? (
                                        <button onClick={() => setVisibleCount(DATA.guestbook.length)}
                                                className="py-4 text-gray-300 text-[11px] font-bold flex items-center gap-2 hover:text-gray-500 transition-colors uppercase tracking-[0.2em]">전체 보기 <ChevronDown size={14}/></button>
                                    ) : (
                                        <button onClick={() => setVisibleCount(3)}
                                                className="py-4 text-gray-300 text-[11px] font-bold flex items-center gap-2 hover:text-gray-500 transition-colors uppercase tracking-[0.2em]">접기 <ChevronUp size={14}/></button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsWriteModalOpen(true)}
                                    className="w-full py-5 border-2 border-[#E8E1D9] text-[#A68F7F] rounded-[1.8rem] font-bold text-[15px] bg-white shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <MessageSquare size={18}/> 축하 메시지 남기기
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

                    <footer className="py-20 bg-white text-center opacity-30 text-[9px] tracking-[0.6em] text-gray-400 font-light uppercase">
                        Binary Wedding Service
                    </footer>

                    {/* 모달 창들 (연락처, 인터뷰, 작성) */}
                    {isContactOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsContactOpen(false)}/>
                            <div className="bg-white w-full max-w-[380px] rounded-[3rem] p-10 relative z-10 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[85vh]">
                                <button onClick={() => setIsContactOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition"><X/></button>
                                <h4 className="font-serif text-2xl mb-12 text-center text-gray-800 font-bold italic underline underline-offset-8 decoration-rose-50 italic">연락하기</h4>
                                <div className="space-y-12">
                                    {(['groom', 'bride'] as const).map((side) => (
                                        <div key={side} className="space-y-8">
                                            <p className="text-[12px] text-rose-300 font-bold font-sans uppercase tracking-[0.3em] border-b border-rose-50 pb-3 text-left">
                                                {side === 'groom' ? '신랑측 GROOM' : '신부측 BRIDE'}
                                            </p>
                                            <div className="space-y-6">
                                                {[{ label: side === 'groom' ? '신랑' : '신부', person: DATA[side] }, { label: '부', person: DATA[side].father }, { label: '모', person: DATA[side].mother }].map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center group">
                                                        <span className="text-base font-bold text-gray-700">{item.label} {item.person.name}</span>
                                                        <div className="flex gap-4">
                                                            <button type="button" onClick={() => toast("샘플 화면에서는 전화를 걸 수 없습니다.")} className="w-10 h-10 bg-[#FDFBF9] border border-rose-50 rounded-full flex items-center justify-center text-rose-300"><Phone size={18}/></button>
                                                            <button type="button" onClick={() => toast("샘플 화면에서는 문자를 보낼 수 없습니다.")} className="w-10 h-10 bg-[#FDFBF9] border border-gray-100 rounded-full flex items-center justify-center text-gray-400"><MessageSquare size={18}/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {isInterviewOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsInterviewOpen(false)}/>
                            <div className="bg-[#FCFAF9] w-full max-w-[360px] rounded-[3rem] p-10 relative z-10 max-h-[75vh] overflow-y-auto animate-fade-in-up shadow-2xl">
                                <button onClick={() => setIsInterviewOpen(false)} className="absolute top-10 right-10 text-gray-300 hover:text-gray-500 transition"><X/></button>
                                <h4 className="font-serif text-2xl mb-14 text-center text-gray-800 font-bold italic underline underline-offset-8 decoration-rose-50 italic">The Story</h4>
                                <div className="space-y-12 text-center text-gray-600">
                                    <div className="space-y-5">
                                        <p className="text-[11px] text-rose-300 font-bold tracking-[0.2em] uppercase font-sans">Q. 우리의 첫 만남은?</p>
                                        <p className="font-serif text-base leading-[2.1] bg-white p-8 rounded-[2rem] shadow-sm italic border border-rose-50">"벚꽃이 흩날리던 어느 봄날이었습니다. 수줍게 웃던 나은이의 모습에 이끌려 오늘까지 오게 되었네요."<span className="text-[10px] text-gray-300 block mt-6 text-right not-italic font-sans uppercase">－ 진호</span></p>
                                    </div>
                                    <div className="space-y-5">
                                        <p className="text-[11px] text-rose-300 font-bold tracking-[0.2em] uppercase font-sans">Q. 서로에게 바라는 점?</p>
                                        <p className="font-serif text-base leading-[2.1] bg-white p-8 rounded-[2rem] shadow-sm italic border border-rose-50">"지금처럼 서로를 아끼고 웃음 가득한 예쁜 가정을 함께 만들어가고 싶어요."<span className="text-[10px] text-gray-300 block mt-6 text-right not-italic font-sans uppercase">－ 나은</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isWriteModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsWriteModalOpen(false)}/>
                            <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] p-10 relative z-10 animate-fade-in-up shadow-2xl border border-rose-50">
                                <button onClick={() => setIsWriteModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition"><X/></button>
                                <div className="text-center mb-10 text-gray-800">
                                    <MessageSquare className="mx-auto text-rose-100 mb-4" size={36}/>
                                    <h4 className="font-serif text-xl font-bold italic underline underline-offset-8 decoration-rose-50 italic">축하 메시지 작성</h4>
                                </div>
                                <div className="space-y-6 text-left">
                                    <div className="space-y-2">
                                        <label htmlFor="writerName" className="text-[13px] font-bold text-gray-800 ml-1">성함</label>
                                        <input id="writerName" type="text" placeholder="성함을 입력해주세요" className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all text-gray-900 font-medium"/>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="writerPw" className="text-[13px] font-bold text-gray-800 ml-1">비밀번호</label>
                                        <input id="writerPw" type="password" placeholder="비밀번호 입력 (수정/삭제 시 필요)" className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all text-gray-900"/>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="writerMsg" className="text-[13px] font-bold text-gray-800 ml-1">메시지</label>
                                        <textarea id="writerMsg" rows={4} placeholder="소중한 축하의 마음을 남겨주세요" className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all resize-none text-gray-900 leading-relaxed"/>
                                    </div>
                                    <button onClick={() => toast("샘플 페이지에서는 작성이 불가능합니다.")} className="w-full py-5 bg-[#B19888] text-white rounded-[1.5rem] font-bold text-[15px] shadow-lg shadow-rose-50/50 active:scale-[0.98] transition-all mt-4">등록하기</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <SiteFooter/>
        </div>
    );
}