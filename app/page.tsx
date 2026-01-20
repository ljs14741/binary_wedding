"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { X, Coffee, Heart, CheckCircle2 } from 'lucide-react';

export default function Home() {
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

    // 접속 시 1초 후 안내 팝업 노출
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsWelcomeOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-rose-500 selection:text-white scroll-smooth">

            {/* 1. 내비게이션 */}
            <header className="fixed top-0 w-full z-[100] bg-white/90 backdrop-blur-md py-4 px-6 flex justify-between items-center border-b border-rose-50 shadow-sm">
                <div className="flex flex-col group">
                    <Link href="/" className="text-xl font-serif font-black tracking-tighter text-slate-900 group-hover:text-rose-600 transition-colors">
                        Binary Wedding
                    </Link>
                    <span className="text-[10px] text-rose-500 font-bold tracking-widest leading-none mt-1">로그인 · 광고 없는 무료 청첩장</span>
                </div>
                <nav className="flex gap-8 text-[14px] font-bold text-slate-700 items-center">
                    <a href="#samples" className="hover:text-rose-600 transition-colors cursor-pointer">샘플 보기</a>
                    <Link href="/make" className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-rose-600 transition-all shadow-md active:scale-95">
                        만들기
                    </Link>
                </nav>
            </header>

            <main>
                {/* 2. 히어로 섹션 */}
                <section className="relative h-[95vh] flex flex-col justify-center items-center px-6 text-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"
                            alt="Main Background"
                            fill
                            priority
                            className="object-cover brightness-[0.7] scale-105"
                        />
                    </div>

                    <div className="relative z-10 space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-bold tracking-[0.1em]">
                            <CheckCircle2 size={14} className="text-rose-300" />
                            회원가입 없이 바로 제작 가능
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.1] drop-shadow-2xl">
                            가장 아름다운 약속, <br />
                            <span className="font-light italic text-rose-50 underline underline-offset-[12px] decoration-white/30">번거로움 없이</span>
                        </h1>
                        <p className="text-base md:text-xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
                            지저분한 광고와 <b>불필요한 가입 절차</b>는 모두 걷어내고<br className="hidden md:block"/>
                            오직 두 사람의 소중한 진심만을 담았습니다.
                        </p>
                        <div className="pt-8">
                            <Link href="/make" className="px-14 py-5 bg-white text-slate-900 rounded-full font-black text-lg shadow-2xl hover:bg-rose-600 hover:text-white transition-all transform hover:-translate-y-1 inline-block">
                                무료로 만들기
                            </Link>
                        </div>
                    </div>

                    <div className="absolute bottom-10 animate-bounce text-white/60 text-[10px] tracking-[0.4em] font-bold uppercase">
                        Scroll to explore
                    </div>
                </section>

                {/* 3. 샘플 미리보기 섹션 */}
                <section id="samples" className="py-32 bg-white px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-20 space-y-4">
                            <span className="text-rose-500 text-sm font-black tracking-widest uppercase italic">Theme Gallery</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tighter">다양한 샘플을 확인해보세요</h2>
                            <p className="text-slate-400 font-medium">취향에 맞는 감성적인 디자인을 선택하세요</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <Link href="/sample/1" className="group block">
                                <div className="relative h-[500px] w-full rounded-[3rem] overflow-hidden mb-6 shadow-xl group-hover:shadow-rose-100 group-hover:shadow-2xl transition-all duration-500 border border-slate-50">
                                    <Image
                                        src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070"
                                        alt="클래식 화이트"
                                        fill
                                        className="object-cover group-hover:scale-110 transition duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition" />
                                    <div className="absolute bottom-10 left-10 text-white">
                                        <span className="bg-rose-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block shadow-sm">Best</span>
                                        <h4 className="text-2xl font-serif font-bold tracking-tight">클래식 화이트</h4>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-center font-bold group-hover:text-rose-600 transition tracking-tight">유행을 타지 않는 정갈함의 미학</p>
                            </Link>

                            <div className="group relative grayscale opacity-60">
                                <div className="relative h-[500px] w-full rounded-[3rem] overflow-hidden mb-6 shadow-lg border border-slate-50">
                                    <Image src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070" alt="내추럴 가든" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                        <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase">Coming Soon</span>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-center font-bold">싱그러운 야외 예식의 감성</p>
                            </div>

                            <div className="group relative grayscale opacity-60">
                                <div className="relative h-[500px] w-full rounded-[3rem] overflow-hidden mb-6 shadow-lg border border-slate-50">
                                    <Image src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070" alt="모던 미니멀" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                        <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase">Coming Soon</span>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-center font-bold">세련되고 깔끔한 레이아웃</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. 특장점 섹션 */}
                <section className="py-32 px-6 bg-rose-50/30">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-6 p-10 bg-white rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="text-5xl">✨</div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">100% 완전 무료</h3>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">결제나 기간 제한 없이 <br/>모든 기능을 자유롭게 사용하세요.</p>
                        </div>
                        <div className="space-y-6 p-10 bg-white rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="text-5xl">🚫</div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">로그인 & 광고 없음</h3>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">번거로운 가입 절차 없이 <br/>축복에만 집중할 수 있습니다.</p>
                        </div>
                        <div className="space-y-6 p-10 bg-white rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="text-5xl">🔒</div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">안전한 정보 보호</h3>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">데이터는 암호화 관리되며 <br/>예식 후 직접 삭제가 가능합니다.</p>
                        </div>
                    </div>
                </section>

                {/* 5. 후원 섹션 */}
                <section id="donate" className="bg-white py-32 text-center px-6 relative overflow-hidden">
                    <div className="max-w-3xl mx-auto space-y-10 relative z-10 font-medium">
                        <div className="inline-block px-4 py-1.5 bg-slate-100 rounded-full text-slate-500 text-xs font-bold tracking-widest uppercase italic mb-4">Developer Story</div>
                        <h2 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight leading-tight">
                            미래의 저도 직접 사용하려고 <br className="md:hidden" />
                            <span className="italic text-rose-600">진심을 담아</span> 만들었습니다.
                        </h2>
                        <p className="text-[17px] text-slate-600 leading-loose">
                            안녕하세요, 6년 차 개발자 Binary입니다. <br />
                            결혼 준비 과정의 거품을 빼고 싶은 마음도 컸지만, <br />
                            <b>미래의 제 결혼식에 직접 쓰기 위해</b> 퇴근 후 정성을 다해 개발했습니다. <br /><br />
                            직접 사용하려 만든 만큼 퀄리티와 편의성은 타협하지 않았습니다. <br />
                            예쁘게 사용해 주시고, 제 노력이 마음에 드셨다면 <br />
                            서버 유지비를 위한 따뜻한 응원을 부탁드립니다.
                        </p>
                        <button className="mt-8 px-12 py-5 bg-[#FEE500] text-[#191919] font-black rounded-[1.5rem] shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto active:scale-95">
                            <Coffee size={24} /> 카카오톡으로 응원하기
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl opacity-40 translate-x-1/2 -translate-y-1/2"></div>
                </section>
            </main>

            {/* 6. 푸터 */}
            <footer className="py-20 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-center md:text-left space-y-3">
                        <h4 className="text-2xl font-serif font-black tracking-tighter text-white">Binary Wedding</h4>
                        <p className="text-xs text-slate-400 uppercase tracking-[0.4em] font-bold">Pure Love, Pure Technology</p>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-5 text-xs font-bold text-slate-400">
                        <div className="flex gap-8 tracking-tight">
                            <Link href="/terms" className="hover:text-rose-400 transition underline underline-offset-4 decoration-rose-400/30">이용약관</Link>
                            <Link href="/privacy" className="hover:text-rose-400 transition font-black text-slate-200 underline underline-offset-4 decoration-rose-400/30">개인정보처리방침</Link>
                        </div>
                        <div className="text-center md:text-right space-y-1 opacity-60">
                            <p>제작: Binary</p>
                            <p>© 2026 BINARY WEDDING. ALL RIGHTS RESERVED.</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* 7. 접속 시 안내 모달 (수정됨) */}
            {isWelcomeOpen && (
                <div className="fixed bottom-8 right-8 z-[200] max-w-[320px] animate-fade-in-up">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-rose-50 p-8 relative overflow-hidden group">
                        <button
                            onClick={() => setIsWelcomeOpen(false)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition"
                        >
                            <X size={20} />
                        </button>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition duration-500">
                                <Heart size={24} fill="currentColor" />
                            </div>
                            <h5 className="font-serif text-xl font-bold text-slate-900 mb-3 tracking-tight">정말 무료인가요?</h5>
                            <p className="text-sm text-slate-500 leading-[1.8] font-medium">
                                네, 100% 무료입니다! 6년 차 개발자인 제가 <b>미래의 제 결혼식에 직접 쓰려고</b> 정성껏 만들었거든요. <br/><br/>
                                예쁘게 사용해 주시고, 마음에 드신다면 커피 한 잔으로 제작자를 응원해 주세요. ☕
                            </p>

                            {/* 모달 내 카카오톡 응원 버튼 */}
                            <button className="w-full mt-6 py-3.5 bg-[#FEE500] text-[#191919] font-black rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm">
                                <Coffee size={14} /> 카카오톡으로 응원하기
                            </button>

                            <div className="mt-6 flex gap-4 font-bold text-[10px] uppercase tracking-widest items-center">
                                <Link href="/make" className="text-rose-600 hover:text-rose-400 transition underline underline-offset-4">만들기</Link>
                                <button onClick={() => setIsWelcomeOpen(false)} className="text-slate-300 hover:text-slate-400">닫기</button>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-rose-50/50 rounded-full blur-2xl"></div>
                    </div>
                </div>
            )}

        </div>
    );
}