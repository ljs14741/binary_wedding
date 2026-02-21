import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
    title: "이용약관 | Binary Wedding",
    description: "Binary Wedding 모바일 청첩장 서비스 이용약관",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#FDFCFB] font-sans flex flex-col">
            <SiteHeader />
            <main className="flex-1 pt-28 pb-20 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto">
                    <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest inline-block mb-8">
                        ← 메인으로
                    </Link>
                    <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">이용약관</h1>
                    <p className="text-slate-500 text-sm mb-12">시행일: 2026년 1월 1일</p>

                    <article className="prose prose-slate max-w-none space-y-8 text-slate-700 text-sm leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">제1조 (목적)</h2>
                            <p>본 약관은 Binary Wedding(이하 &quot;서비스&quot;)이 제공하는 모바일 청첩장 웹 서비스의 이용 조건 및 절차, 회원과 서비스 제공자 간의 권리·의무에 관한 사항을 규정함을 목적으로 합니다.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">제2조 (서비스 내용)</h2>
                            <p>서비스는 이용자가 온라인으로 청첩장을 제작하고, URL을 통해 하객에게 공유할 수 있는 무료 웹 플랫폼을 제공합니다. 서비스에는 청첩장 생성, 수정, 삭제, 조회, 사진·텍스트 업로드, 지도 연동 등이 포함됩니다.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">제3조 (이용자의 의무)</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>이용자는 타인의 명의·정보를 도용하거나 허위 정보를 입력하여서는 안 됩니다.</li>
                                <li>저작권·초상권 등 타인의 권리를 침해하는 콘텐츠를 업로드하여서는 안 됩니다.</li>
                                <li>서비스의 정상 운영을 방해하는 행위를 하여서는 안 됩니다.</li>
                                <li>청첩장 비밀번호는 본인이 관리하며, 분실 시 조회·수정·삭제가 불가할 수 있습니다.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">제4조 (데이터 보관 및 폐기)</h2>
                            <p>청첩장 데이터는 결혼식일로부터 1개월 경과 후 자동 삭제됩니다. 삭제된 데이터는 복구할 수 없습니다.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">제5조 (서비스 변경·중단)</h2>
                            <p>서비스 제공자는 서비스의 전부 또는 일부를 사전 공지 후 변경·중단할 수 있습니다. 단, 긴급한 사유가 있는 경우 사후 공지할 수 있습니다.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">제6조 (면책)</h2>
                            <p>서비스 제공자는 천재지변, 시스템 고장, 제3자의 불법 행위 등 불가항력적 사유로 인한 서비스 장애에 대해 책임을 지지 않습니다. 이용자가 업로드한 콘텐츠로 인한 법적 분쟁의 책임은 이용자에게 있습니다.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">제7조 (약관 변경)</h2>
                            <p>본 약관은 필요한 경우 변경될 수 있으며, 변경 시 서비스 내 공지 또는 이메일 등으로 안내합니다. 변경된 약관 시행일 이후 계속 이용하는 경우 동의한 것으로 간주됩니다.</p>
                        </section>
                    </article>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
