import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
    title: "개인정보처리방침 | Binary Wedding",
    description: "Binary Wedding 모바일 청첩장 서비스 개인정보처리방침",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#FDFCFB] font-sans flex flex-col">
            <SiteHeader />
            <main className="flex-1 pt-28 pb-20 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto">
                    <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest inline-block mb-8">
                        ← 메인으로
                    </Link>
                    <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">개인정보처리방침</h1>
                    <p className="text-slate-500 text-sm mb-12">시행일: 2026년 1월 1일</p>

                    <article className="prose prose-slate max-w-none space-y-8 text-slate-700 text-sm leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">1. 수집하는 개인정보 항목</h2>
                            <p>서비스 이용 시 아래와 같은 정보가 수집됩니다.</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li><strong>필수:</strong> 신랑·신부 이름, 연락처(휴대폰 번호), 예식 일시, 예식장 정보, 주소</li>
                                <li><strong>선택:</strong> 혼주 정보, 계좌 정보, 사진, 인터뷰 내용</li>
                                <li><strong>자동:</strong> 비밀번호(암호화 저장), 서비스 이용 기록</li>
                            </ul>
                            <p className="mt-3">청첩장 비밀번호는 암호화되어 저장되며, 원문을 확인할 수 없습니다.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">2. 수집 목적</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>청첩장 제작·공유·관리 서비스 제공</li>
                                <li>본인 확인 및 청첩장 수정·삭제 권한 확인</li>
                                <li>서비스 품질 개선 및 안정적 운영</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">3. 보관 기간</h2>
                            <p>수집된 개인정보는 <strong>결혼식일로부터 1개월이 경과한 시점</strong>에 자동 삭제됩니다. 이용자가 직접 삭제한 경우 해당 시점에 삭제됩니다. 삭제된 정보는 복구할 수 없습니다.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">4. 제3자 제공</h2>
                            <p>원칙적으로 수집된 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다.</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>이용자가 사전에 동의한 경우</li>
                                <li>법령에 따라 요구되는 경우</li>
                                <li>지도·주소 검색 등 서비스 제공을 위해 필요한 경우(해당 업체의 개인정보처리방침 적용)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">5. 이용자의 권리</h2>
                            <p>이용자는 언제든지 본인의 청첩장을 조회·수정·삭제할 수 있습니다. 내 청첩장 관리 페이지에서 이름·연락처·비밀번호로 로그인 후 수정 및 삭제가 가능합니다.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">6. 개인정보 보호 조치</h2>
                            <p>비밀번호는 bcrypt 등 적절한 방식으로 암호화하여 저장합니다. 개인정보에 대한 접근 권한을 최소한의 인원으로 제한하고, 관련 법령을 준수합니다.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">7. 문의</h2>
                            <p>개인정보처리방침에 관한 문의는 카카오톡 채널 등을 통해 연락해 주시기 바랍니다.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-3">8. 변경사항</h2>
                            <p>본 방침은 법령·정책 변경 시 수정될 수 있으며, 변경 시 서비스 내 공지합니다.</p>
                        </section>
                    </article>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
