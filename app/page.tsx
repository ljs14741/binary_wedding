import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "바이너리 웨딩 | 광고 없는 무료 모바일 청첩장",
    description: "로그인 없이 3분 만에 만드는 감성 모바일 청첩장. 광고 없음, 비용 0원. 현직 개발자가 만든 재능기부 프로젝트.",
    keywords: ["모바일청첩장", "무료모바일청첩장", "모바일청첩장만들기", "셀프청첩장"],
    openGraph: {
        title: "바이너리 웨딩 - 비용 걱정 없는 아름다운 시작",
        description: "광고 없는 100% 무료 모바일 청첩장. 로그인 없이 지금 바로 만들어보세요.",
        type: "website",
    },
};

export default function Home() {
    return (
        <div className="min-h-screen bg-[#FDFCFB] text-[#333] font-sans selection:bg-[#F3E9E2]">

            {/* 1. 내비게이션: 직관적인 한글 메뉴 */}
            <header className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md py-5 px-6 flex justify-between items-center border-b border-gray-50">
                <div className="flex flex-col">
                    <Link href="/" className="text-lg font-bold tracking-tighter text-gray-900">
                        바이너리 웨딩
                    </Link>
                    <span className="text-[10px] text-rose-500 font-medium leading-none">광고 없는 무료 모바일 청첩장</span>
                </div>
                <nav className="flex gap-6 text-[14px] font-medium text-gray-600">
                    <Link href="/samples" className="hover:text-black transition">샘플 보기</Link>
                    <Link href="#create" className="text-gray-900 font-bold border-b-2 border-gray-900">만들기</Link>
                </nav>
            </header>

            <main>
                {/* 2. 히어로 섹션: '무료' 키워드와 감성의 조화 */}
                <section className="relative h-[90vh] flex flex-col justify-center items-center px-6 text-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"
                            className="w-full h-full object-cover brightness-[0.9] scale-105"
                            alt="무료 모바일 청첩장 메인 이미지"
                        />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full text-white text-xs tracking-widest">
                            COST-FREE & AD-FREE
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif text-white leading-[1.1] drop-shadow-lg">
                            가장 아름다운 약속, <br/>
                            <span className="font-italic">비용 걱정 없이</span> 담으세요
                        </h1>
                        <p className="text-base md:text-lg text-white/90 font-light leading-relaxed max-w-2xl mx-auto drop-shadow">
                            복잡한 가입 절차나 추가 비용 요구에 지치셨나요? <br/>
                            바이너리 웨딩은 오직 두 사람의 행복만을 생각하며 만든 <br/>
                            <b>진짜 무료 모바일 청첩장</b> 서비스입니다.
                        </p>
                        <div className="pt-6">
                            <Link href="/make" className="px-10 py-5 bg-white text-gray-900 rounded-full font-bold text-lg shadow-2xl hover:bg-gray-50 transition transform hover:-translate-y-1 inline-block">
                                3분 만에 무료로 만들기
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 3. 특장점 섹션: 왜 우리 서비스를 써야 하는가 (SEO 타겟팅) */}
                <section className="py-24 px-6 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4">
                            <div className="text-3xl">✨</div>
                            <h3 className="text-xl font-bold text-gray-900">100% 완전 무료</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">기본 기능부터 프리미엄 테마까지 <br/>조건 없이 모두 무료로 제공됩니다.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="text-3xl">🚫</div>
                            <h3 className="text-xl font-bold text-gray-900">광고 및 가입 없음</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">청첩장 하단에 지저분한 광고가 없으며 <br/>로그인 없이도 즉시 제작 가능합니다.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="text-3xl">📱</div>
                            <h3 className="text-xl font-bold text-gray-900">모바일 최적화</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">어떤 스마트폰에서도 깨지지 않는 <br/>반응형 고퀄리티 디자인을 보장합니다.</p>
                        </div>
                    </div>
                </section>

                {/* 4. 후원 섹션: 진심이 느껴지는 문구 */}
                <section id="donate" className="bg-[#F8F5F2] py-28 text-center px-6">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h2 className="text-3xl font-serif text-gray-800">마음이 닿으셨다면</h2>
                        <p className="text-[15px] text-gray-600 leading-loose">
                            바이너리 웨딩은 더 많은 분들이 비용 부담 없이 <br/>
                            행복한 예식을 준비하시길 바라는 마음으로 운영되고 있습니다. <br/>
                            서비스가 만족스러우셨다면, 서버 유지비를 위한 <br/>
                            <b>따뜻한 커피 한 잔</b>으로 제작자를 응원해 주세요.
                        </p>
                        <button className="mt-4 px-8 py-4 bg-[#FEE500] text-[#191919] font-bold rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-2 mx-auto">
                            카카오톡으로 응원하기
                        </button>
                    </div>
                </section>
            </main>

            {/* 5. 깔끔한 푸터 */}
            <footer className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-bold tracking-tighter text-gray-900">바이너리 웨딩</h4>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Pure Love, Pure Technology</p>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-2 text-[12px] text-gray-400">
                        <div className="flex gap-4 mb-2">
                            <Link href="/terms" className="hover:text-gray-600">이용약관</Link>
                            <Link href="/privacy" className="hover:text-gray-600 font-bold">개인정보처리방침</Link>
                        </div>
                        <span>제작: Binary</span>
                        <span>© 2026 BINARY WEDDING. ALL RIGHTS RESERVED.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}