"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Script from "next/script";
import { Noto_Serif_KR } from "next/font/google";
import { motion } from "framer-motion";
import {
    Phone, Copy, Navigation, ChevronDown, ChevronUp, X,
    MessageSquare, Music, Share, Heart, MapPin
} from "lucide-react";

const serif = Noto_Serif_KR({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-serif"
});

// 네이버 지도 타입 선언
declare global {
    interface Window {
        naver: any;
        Kakao: any;
    }
}

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};

interface Type1Props {
    data: {
        groom: { name: string; contact: string; father: string; mother: string; father_contact?: string; mother_contact?: string };
        bride: { name: string; contact: string; father: string; mother: string; father_contact?: string; mother_contact?: string };
        date: Date;
        location: string;
        detail: string;
        address: string;
        message: string;
        mainImage: string;
        gallery: string[];
        transport: { subway: string; bus: string; parking: string };
        accounts: { side: string; bank: string; num: string; name: string }[];
        interviews: { q: string; a: string }[];
    }
}

export default function Type1({ data }: Type1Props) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isInterviewOpen, setIsInterviewOpen] = useState(false);
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false); // 방명록 작성 모달
    const [openAccount, setOpenAccount] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    const weddingDate = new Date(data.date);
    const weddingYear = weddingDate.getFullYear();
    const weddingMonth = weddingDate.getMonth();
    const weddingDay = weddingDate.getDate();
    // 요일 계산 (일, 월, 화...)
    const weddingDayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][weddingDate.getDay()];

    // 달력 계산용
    const firstDayOfMonth = new Date(weddingYear, weddingMonth, 1).getDay();
    const daysInMonth = new Date(weddingYear, weddingMonth + 1, 0).getDate();

    // 지도 초기화
    const initMap = () => {
        // 좌표가 없으면 주소로 검색하는 로직이 필요하지만, 여기서는 예시로 고정 좌표 혹은 주소 검색 링크를 사용
        // 실제 서비스에선 Geocoding API가 필요할 수 있음. 일단은 지도 컨테이너 표시.
        if (!mapRef.current || !window.naver) return;

        // *참고: 실제 위경도를 DB에 저장하지 않았다면 기본값(서울)이나 geocoding이 필요함.
        // 현재는 에러 방지를 위해 지도 UI만 띄웁니다.
        const mapOptions = {
            center: new window.naver.maps.LatLng(37.5225, 127.0392), // 임시 좌표 (강남구청 인근)
            zoom: 16,
            zoomControl: false,
            scrollWheel: false,
        };
        const map = new window.naver.maps.Map(mapRef.current, mapOptions);
        new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(37.5225, 127.0392),
            map: map,
        });
    };

    // 카카오 공유
    const shareKakao = () => {
        if (window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init("ea07c2afa5b5a0a07737bab48ab8e3e8");
            }
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `${data.groom.name} ♥ ${data.bride.name} 결혼합니다`,
                    description: `${weddingYear}년 ${weddingMonth + 1}월 ${weddingDay}일 ${data.location}`,
                    imageUrl: data.mainImage || "https://via.placeholder.com/800",
                    link: { mobileWebUrl: window.location.href, webUrl: window.location.href },
                },
                buttons: [{ title: '청첩장 보기', link: { mobileWebUrl: window.location.href, webUrl: window.location.href } }],
            });
        }
    };

    // 카운트다운 로직 복원
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

    // 음악 자동 재생
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
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("복사되었습니다.");
    };

    const groomAccounts = data.accounts.filter(acc => acc.side === 'groom');
    const brideAccounts = data.accounts.filter(acc => acc.side === 'bride');

    return (
        <div className={`${serif.variable} font-sans bg-[#FAF8F6] min-h-screen flex justify-center selection:bg-rose-50`}>
            {/* 네이버 지도 스크립트 복원 */}
            <Script
                strategy="afterInteractive"
                src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=xmxkex3spn`}
                onLoad={initMap}
            />
            <Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" onLoad={() => window.Kakao?.init("ea07c2afa5b5a0a07737bab48ab8e3e8")} />

            <div className="w-full max-w-[430px] bg-white shadow-2xl relative flex flex-col overflow-hidden">
                <audio ref={audioRef} loop src="/music/sample1.mp3"/>

                {/* 1. 메인 섹션 */}
                <section className="relative h-[100vh]">
                    {data.mainImage ? (
                        <Image src={data.mainImage} alt="메인 웨딩 사진" fill className="object-cover brightness-95" priority />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">사진 없음</div>
                    )}

                    <div className="absolute top-8 right-8 z-30">
                        <button onClick={toggleMusic} className="transition-transform active:scale-95">
                            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-sm transition-all duration-700 ${isPlaying ? "bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white/40" : "bg-black/5 border border-white/20"}`}>
                                <Music size={18} className={`transition-colors duration-700 ${isPlaying ? "text-rose-400 animate-[pulse_3s_infinite]" : "text-white/80"}`} strokeWidth={1.5}/>
                                {isPlaying && <div className="absolute inset-0 rounded-full border border-white/30 animate-[ping_2s_infinite]"></div>}
                            </div>
                        </button>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-between py-28 text-white text-center z-10">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
                            <p className="text-[11px] tracking-[0.4em] font-light opacity-80 uppercase font-sans">Save the Date</p>
                            <h1 className="text-4xl font-serif mt-6 font-bold tracking-tighter">
                                {data.groom.name} <span className="font-light mx-1">&</span> {data.bride.name}
                            </h1>
                        </motion.div>
                        <motion.div className="font-serif" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.5 }}>
                            <p className="text-xl tracking-widest uppercase">{weddingYear}. {weddingMonth + 1}. {weddingDay}. {weddingDayOfWeek}</p>
                            <p className="text-sm font-light opacity-80 mt-2">{data.location} {data.detail}</p>
                        </motion.div>
                    </div>
                </section>

                {/* 2. 초대글 */}
                <section className="py-28 px-10 text-center bg-white">
                    <FadeIn>
                        <Heart className="mx-auto text-rose-200 mb-10" size={26}/>
                        <h2 className="font-serif text-2xl mb-12 tracking-[0.15em] underline underline-offset-8 decoration-rose-50 font-bold italic">초대합니다</h2>
                        <p className="font-serif text-[17px] leading-[2.3] text-gray-600 mb-16 whitespace-pre-wrap">
                            {data.message}
                        </p>
                    </FadeIn>

                    {data.gallery.length > 0 && (
                        <FadeIn delay={0.2}>
                            <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden mb-16 shadow-xl shadow-rose-50/50">
                                <Image src={data.gallery[0]} alt="서브 사진" fill className="object-cover" />
                            </div>
                        </FadeIn>
                    )}

                    <FadeIn delay={0.3}>
                        <div className="space-y-6 text-gray-800 font-serif mb-12 text-lg">
                            <div>
                                <span className="text-gray-400 font-sans text-sm mr-3">신랑</span> <b>{data.groom.name}</b> <span className="text-gray-300 mx-2">|</span> {data.groom.father} · {data.groom.mother}의 장남
                            </div>
                            <div>
                                <span className="text-gray-400 font-sans text-sm mr-3">신부</span> <b>{data.bride.name}</b> <span className="text-gray-300 mx-2">|</span> {data.bride.father} · {data.bride.mother}의 차녀
                            </div>
                        </div>
                        <button onClick={() => setIsContactOpen(true)} className="px-12 py-5 bg-[#FBF7F4] text-[#B19888] rounded-2xl font-bold text-sm flex items-center gap-3 mx-auto shadow-sm active:scale-95 transition-all">
                            <Phone size={16} /> 연락처 보기
                        </button>
                    </FadeIn>
                </section>

                {/* 3. 달력 & 디데이 (복원됨) */}
                <section className="py-24 bg-[#FCFAF8] text-center border-y border-[#F3EFEA]">
                    <FadeIn>
                        <div className="mb-12">
                            <h3 className="font-serif text-2xl text-gray-800 tracking-tighter italic font-bold">{weddingYear}년 {weddingMonth + 1}월 {weddingDay}일</h3>
                            <p className="font-serif text-rose-300 mt-2 font-bold tracking-widest text-sm uppercase">
                                {weddingDayOfWeek}요일 {weddingDate.getHours() > 12 ? `PM ${weddingDate.getHours() - 12}` : `AM ${weddingDate.getHours()}`}:{String(weddingDate.getMinutes()).padStart(2, '0')}
                            </p>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <div className="max-w-[290px] mx-auto grid grid-cols-7 gap-y-5 text-sm mb-16 px-2">
                            {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className={`font-bold text-[11px] ${d === '일' ? 'text-rose-400' : 'text-gray-300'}`}>{d}</div>)}
                            {Array.from({ length: firstDayOfMonth }, (_, i) => (<div key={`empty-${i}`} />))}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const day = i + 1;
                                const isWeddingDay = day === weddingDay;
                                return (
                                    <div key={day} className={`py-1.5 flex items-center justify-center transition-all ${isWeddingDay ? 'bg-rose-400 text-white rounded-full font-bold shadow-lg scale-110' : 'text-gray-600 font-light'}`}>
                                        {day}
                                    </div>
                                );
                            })}
                        </div>
                    </FadeIn>

                    {/* D-Day 카운트다운 복원 */}
                    <FadeIn delay={0.3}>
                        <div className="flex justify-center items-center gap-5 text-gray-800">
                            <div className="flex flex-col items-center"><span className="text-3xl font-serif tabular-nums">{String(timeLeft.days).padStart(2, '0')}</span><span className="text-[9px] text-gray-400 mt-2 font-bold tracking-[0.2em] font-sans">DAYS</span></div>
                            <span className="text-2xl font-bold text-gray-400 mb-6 opacity-70">:</span>
                            <div className="flex flex-col items-center"><span className="text-3xl font-serif tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</span><span className="text-[9px] text-gray-400 mt-2 font-bold tracking-[0.2em] font-sans">HOURS</span></div>
                            <span className="text-2xl font-bold text-gray-400 mb-6 opacity-70">:</span>
                            <div className="flex flex-col items-center"><span className="text-3xl font-serif tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</span><span className="text-[9px] text-gray-400 mt-2 font-bold tracking-[0.2em] font-sans">MINS</span></div>
                            <span className="text-2xl font-bold text-gray-400 mb-6 opacity-70">:</span>
                            <div className="flex flex-col items-center"><span className="text-3xl font-serif tabular-nums">{String(timeLeft.seconds).padStart(2, '0')}</span><span className="text-[9px] text-gray-400 mt-2 font-bold tracking-[0.2em] font-sans">SECS</span></div>
                        </div>
                    </FadeIn>
                </section>

                {/* 4. 오시는 길 (Location 자막 및 지도 복원) */}
                <section className="py-24 px-8 bg-white">
                    <FadeIn>
                        <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter underline underline-offset-8 decoration-gray-100 italic font-bold">오시는 길</h3>
                        <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Location</p>
                        <p className="text-center text-gray-800 font-bold text-lg mb-1">{data.location} {data.detail}</p>
                        <p className="text-center text-gray-400 text-[13px] mb-12 font-serif">{data.address}</p>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        {/* 지도 영역 */}
                        <div ref={mapRef} id="map" className="w-full h-[350px] rounded-3xl bg-[#F9F9F9] mb-12 shadow-inner border border-gray-100 overflow-hidden relative">
                            {/* 지도가 로드되지 않았을 때를 대비한 플레이스홀더 */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                지도를 불러오는 중입니다.
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-12">
                            <a href={`https://map.naver.com/v5/search/${encodeURIComponent(data.address)}`} target="_blank" className="flex flex-col items-center gap-2 py-4 bg-[#FBFBFB] rounded-2xl border border-gray-50 active:bg-gray-100 transition shadow-sm hover:bg-gray-50">
                                <Navigation size={18} className="text-[#03C75A]" /> <span className="text-[11px] text-gray-500 font-bold">네이버 지도</span>
                            </a>
                            <a href={`https://map.kakao.com/link/search/${encodeURIComponent(data.address)}`} target="_blank" className="flex flex-col items-center gap-2 py-4 bg-[#FBFBFB] rounded-2xl border border-gray-50 active:bg-gray-100 transition shadow-sm hover:bg-gray-50">
                                <Navigation size={18} className="text-[#FEE500]" /> <span className="text-[11px] text-gray-500 font-bold">카카오 내비</span>
                            </a>
                            <a href={`tmap://search?name=${encodeURIComponent(data.address)}`} className="flex flex-col items-center gap-2 py-4 bg-[#FBFBFB] rounded-2xl border border-gray-50 active:bg-gray-100 transition shadow-sm hover:bg-gray-50">
                                <Navigation size={18} className="text-[#ED1C24]" /> <span className="text-[11px] text-gray-500 font-bold">T맵</span>
                            </a>
                        </div>

                        <div className="space-y-8 text-[14px] border-t border-gray-50 pt-10 text-left">
                            {data.transport.subway && (
                                <div className="flex gap-5">
                                    <span className="shrink-0 w-14 h-7 bg-[#F3F4F6] text-[#4B5563] rounded-lg text-[10px] flex items-center justify-center font-bold whitespace-nowrap">지하철</span>
                                    <p className="text-gray-500 font-light flex-1 leading-relaxed text-sm whitespace-pre-line">{data.transport.subway}</p>
                                </div>
                            )}
                            {data.transport.bus && (
                                <div className="flex gap-5">
                                    <span className="shrink-0 w-14 h-7 bg-[#F3F4F6] text-[#4B5563] rounded-lg text-[10px] flex items-center justify-center font-bold whitespace-nowrap">버스</span>
                                    <p className="text-gray-500 font-light flex-1 leading-relaxed text-sm whitespace-pre-line">{data.transport.bus}</p>
                                </div>
                            )}
                            {data.transport.parking && (
                                <div className="flex gap-5">
                                    <span className="shrink-0 w-14 h-7 bg-[#F3F4F6] text-[#4B5563] rounded-lg text-[10px] flex items-center justify-center font-bold whitespace-nowrap">주차</span>
                                    <p className="text-gray-500 font-light flex-1 leading-relaxed text-sm whitespace-pre-line">{data.transport.parking}</p>
                                </div>
                            )}
                        </div>
                    </FadeIn>
                </section>

                {/* 5. 인터뷰 */}
                {data.interviews.length > 0 && (
                    <section className="py-24 px-10 bg-[#FAF9F7] text-center border-y border-[#F3EFEA]">
                        <FadeIn>
                            <Heart className="mx-auto text-rose-50 mb-8" size={24}/>
                            <h3 className="font-serif text-2xl text-gray-800 mb-2 italic">우리의 이야기</h3>
                            <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">The Story</p>
                            <button onClick={() => setIsInterviewOpen(true)} className="px-12 py-5 bg-white text-[#A68F7F] rounded-[2rem] text-[15px] font-bold shadow-sm hover:shadow-md transition-all border border-rose-50 active:scale-95">
                                인터뷰 보기
                            </button>
                        </FadeIn>
                    </section>
                )}

                {/* 6. 갤러리 */}
                <section className="py-24">
                    <FadeIn>
                        <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter underline underline-offset-8 decoration-gray-100 italic font-bold">웨딩 갤러리</h3>
                        <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Gallery</p>
                    </FadeIn>
                    <div className="grid grid-cols-2 gap-1 px-1">
                        {data.gallery.map((img, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className={`relative w-full ${i === 0 ? 'col-span-2 aspect-[4/3]' : 'aspect-square'}`}>
                                    <Image src={img} alt={`Gallery ${i}`} fill className="object-cover" />
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </section>

                {/* 7. 마음 전하실 곳 */}
                <section className="py-24 px-8 bg-[#FBF9F7]">
                    <FadeIn>
                        <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter italic font-bold">마음 전하실 곳</h3>
                        <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Gift</p>
                    </FadeIn>
                    <div className="space-y-4">
                        {groomAccounts.length > 0 && (
                            <div className="border border-rose-50 rounded-[2rem] overflow-hidden shadow-sm shadow-rose-50/20">
                                <button onClick={() => setOpenAccount(openAccount === 'groom' ? null : 'groom')} className={`w-full flex justify-between items-center p-7 transition-colors ${openAccount === 'groom' ? 'bg-rose-50/30 text-rose-400' : 'bg-white text-gray-700'}`}>
                                    <span className="font-serif font-bold">신랑측 계좌번호</span>
                                    {openAccount === 'groom' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {openAccount === 'groom' && (
                                    <div className="p-7 bg-white space-y-7 divide-y divide-gray-50 text-left">
                                        {groomAccounts.map((acc, i) => (
                                            <div key={i} className="pt-6 first:pt-0 flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <p className="text-[15px] font-bold text-gray-700">{acc.name}</p>
                                                    <p className="text-[12px] text-gray-400 font-sans tracking-tight">{acc.bank} {acc.num}</p>
                                                </div>
                                                <button onClick={() => copyText(acc.num)} className="text-[11px] text-gray-400 bg-gray-50 px-4 py-2 rounded-full font-bold shadow-sm active:bg-gray-100 transition">복사</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {brideAccounts.length > 0 && (
                            <div className="border border-rose-50 rounded-[2rem] overflow-hidden shadow-sm shadow-rose-50/20">
                                <button onClick={() => setOpenAccount(openAccount === 'bride' ? null : 'bride')} className={`w-full flex justify-between items-center p-7 transition-colors ${openAccount === 'bride' ? 'bg-rose-50/30 text-rose-400' : 'bg-white text-gray-700'}`}>
                                    <span className="font-serif font-bold">신부측 계좌번호</span>
                                    {openAccount === 'bride' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {openAccount === 'bride' && (
                                    <div className="p-7 bg-white space-y-7 divide-y divide-gray-50 text-left">
                                        {brideAccounts.map((acc, i) => (
                                            <div key={i} className="pt-6 first:pt-0 flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <p className="text-[15px] font-bold text-gray-700">{acc.name}</p>
                                                    <p className="text-[12px] text-gray-400 font-sans tracking-tight">{acc.bank} {acc.num}</p>
                                                </div>
                                                <button onClick={() => copyText(acc.num)} className="text-[11px] text-gray-400 bg-gray-50 px-4 py-2 rounded-full font-bold shadow-sm active:bg-gray-100 transition">복사</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* 8. 방명록 (복원됨) */}
                <section className="py-24 px-8 bg-white border-t border-gray-50">
                    <FadeIn>
                        <h3 className="text-center font-serif text-2xl mb-2 text-gray-800 tracking-tighter italic font-bold">방명록</h3>
                        <p className="text-center text-gray-300 text-[10px] tracking-[0.3em] uppercase font-sans mb-12 italic font-bold">Guestbook</p>
                    </FadeIn>

                    {/* 방명록 데이터가 없어도 UI는 보여줌 (빈 상태) */}
                    <div className="space-y-5 mb-12">
                        <div className="bg-[#FAF9F8] p-7 rounded-[2rem] shadow-sm text-center text-gray-400 text-sm py-12 border border-gray-50">
                            아직 작성된 메시지가 없습니다.<br/>첫 번째 축하 글을 남겨주세요! 💌
                        </div>
                    </div>

                    <FadeIn>
                        <button
                            onClick={() => setIsWriteModalOpen(true)}
                            className="w-full py-5 border-2 border-[#E8E1D9] text-[#A68F7F] rounded-[1.8rem] font-bold text-[15px] bg-white shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <MessageSquare size={18} /> 축하 메시지 남기기
                        </button>
                    </FadeIn>
                </section>

                {/* 9. 공유하기 */}
                <section className="py-20 px-8 bg-[#FEE500]/5 text-center">
                    <FadeIn>
                        <p className="text-gray-400 text-[11px] mb-6 font-bold tracking-widest">INVITATION</p>
                        <button onClick={shareKakao} className="w-full py-5 bg-[#FEE500] text-[#191919] rounded-[1.8rem] font-bold text-[15px] shadow-md hover:shadow-lg hover:bg-[#FDD835] transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                            <Share size={18} /> 카카오톡으로 공유하기
                        </button>
                    </FadeIn>
                </section>

                <footer className="py-20 bg-white text-center opacity-30 text-[9px] tracking-[0.6em] text-gray-400 font-light font-sans uppercase">
                    Binary Wedding Service
                </footer>

                {/* 모달: 연락처 (스타일 복원) */}
                {isContactOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in" role="dialog" aria-modal="true">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsContactOpen(false)} />
                        <div className="bg-white w-full max-w-[380px] rounded-[3rem] p-10 relative z-10 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[85vh]">
                            <button onClick={() => setIsContactOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition"><X /></button>
                            <h4 className="font-serif text-2xl mb-12 text-center text-gray-800 font-bold italic underline underline-offset-8 decoration-rose-50 italic">연락하기</h4>
                            <div className="space-y-12">
                                <div className="space-y-8">
                                    <p className="text-[12px] text-rose-300 font-bold font-sans uppercase tracking-[0.3em] border-b border-rose-50 pb-3 text-left">신랑측 GROOM</p>
                                    <ContactRow label="신랑" name={data.groom.name} phone={data.groom.contact} />
                                    {data.groom.father && <ContactRow label="혼주(부)" name={data.groom.father} phone={data.groom.father_contact || ""} />}
                                    {data.groom.mother && <ContactRow label="혼주(모)" name={data.groom.mother} phone={data.groom.mother_contact || ""} />}
                                </div>
                                <div className="space-y-8">
                                    <p className="text-[12px] text-rose-300 font-bold font-sans uppercase tracking-[0.3em] border-b border-rose-50 pb-3 text-left">신부측 BRIDE</p>
                                    <ContactRow label="신부" name={data.bride.name} phone={data.bride.contact} />
                                    {data.bride.father && <ContactRow label="혼주(부)" name={data.bride.father} phone={data.bride.father_contact || ""} />}
                                    {data.bride.mother && <ContactRow label="혼주(모)" name={data.bride.mother} phone={data.bride.mother_contact || ""} />}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 모달: 인터뷰 (스타일 복원) */}
                {isInterviewOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsInterviewOpen(false)} />
                        <div className="bg-[#FCFAF9] w-full max-w-[360px] rounded-[3rem] p-10 relative z-10 max-h-[75vh] overflow-y-auto animate-fade-in-up shadow-2xl">
                            <button onClick={() => setIsInterviewOpen(false)} className="absolute top-10 right-10 text-gray-300 hover:text-gray-500 transition"><X /></button>
                            <h4 className="font-serif text-2xl mb-14 text-center text-gray-800 font-bold italic underline underline-offset-8 decoration-rose-50 italic">The Story</h4>
                            <div className="space-y-12 text-center text-gray-600">
                                {data.interviews.map((iv, i) => (
                                    <div key={i} className="space-y-5">
                                        <p className="text-[11px] text-rose-300 font-bold tracking-[0.2em] uppercase font-sans">Q. {iv.q}</p>
                                        <p className="font-serif text-base leading-[2.1] bg-white p-8 rounded-[2rem] shadow-sm italic border border-rose-50 whitespace-pre-line">
                                            "{iv.a}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 모달: 방명록 작성 (UI만 복원, 기능은 추후 구현) */}
                {isWriteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsWriteModalOpen(false)} />
                        <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] p-10 relative z-10 animate-fade-in-up shadow-2xl border border-rose-50">
                            <button onClick={() => setIsWriteModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition"><X /></button>
                            <div className="text-center mb-10 text-gray-800">
                                <MessageSquare className="mx-auto text-rose-100 mb-4" size={36} />
                                <h4 className="font-serif text-xl font-bold italic underline underline-offset-8 decoration-rose-50 italic">축하 메시지 작성</h4>
                            </div>
                            <div className="space-y-6 text-left">
                                <div className="space-y-2">
                                    <label htmlFor="writerName" className="text-[13px] font-bold text-gray-800 ml-1">성함</label>
                                    <input id="writerName" type="text" placeholder="성함을 입력해주세요" className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all text-gray-900 font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="writerPw" className="text-[13px] font-bold text-gray-800 ml-1">비밀번호</label>
                                    <input id="writerPw" type="password" placeholder="비밀번호 입력 (수정/삭제 시 필요)" className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all text-gray-900" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="writerMsg" className="text-[13px] font-bold text-gray-800 ml-1">메시지</label>
                                    <textarea id="writerMsg" rows={4} placeholder="소중한 축하의 마음을 남겨주세요" className="w-full px-5 py-4 bg-[#FDFBF9] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-50 transition-all resize-none text-gray-900 leading-relaxed" />
                                </div>
                                <button onClick={() => alert("방명록 저장 기능은 준비 중입니다!")} className="w-full py-5 bg-[#B19888] text-white rounded-[1.5rem] font-bold text-[15px] shadow-lg shadow-rose-50/50 active:scale-[0.98] transition-all mt-4">등록하기</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// 연락처 행 컴포넌트
function ContactRow({ label, name, phone }: { label: string, name: string, phone: string }) {
    if (!phone) return null;
    return (
        <div className="flex justify-between items-center group">
            <span className="text-base font-bold text-gray-700">{label} {name}</span>
            <div className="flex gap-4">
                <a href={`tel:${phone}`} className="w-10 h-10 bg-[#FDFBF9] border border-rose-50 rounded-full flex items-center justify-center text-rose-300 hover:bg-rose-50 transition"><Phone size={18} /></a>
                <a href={`sms:${phone}`} className="w-10 h-10 bg-[#FDFBF9] border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition"><MessageSquare size={18} /></a>
            </div>
        </div>
    );
}