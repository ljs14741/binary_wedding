import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="py-16 sm:py-20 bg-slate-900 text-white overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-10">
                <div className="text-center md:text-left space-y-3">
                    <h4 className="text-2xl font-serif font-black tracking-tighter text-white">Binary Wedding</h4>
                    <p className="text-xs text-slate-400 uppercase tracking-[0.4em] font-bold">Pure Love, Pure Technology</p>
                </div>
                <div className="flex flex-col items-center md:items-end gap-5 text-xs font-bold text-slate-400">
                    <div className="flex flex-wrap justify-center md:justify-end gap-6 sm:gap-8 tracking-tight">
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
    );
}