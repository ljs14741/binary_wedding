"use client";

import { createInvitation } from "@/app/actions";
import { useState } from "react";
import { Upload, Calendar, MapPin, Heart, Car, MessageCircle, CreditCard, User, Users, ChevronRight } from "lucide-react";

export default function MakePage() {
    const [loading, setLoading] = useState(false);

    return (
        <div className="min-h-screen bg-[#FDFCFB] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-rose-100">
            <div className="max-w-4xl mx-auto">

                {/* 헤더 섹션 */}
                <div className="text-center mb-16 space-y-4">
                    <span className="text-rose-500 font-bold tracking-widest text-xs uppercase bg-rose-50 px-3 py-1 rounded-full">Test Mode</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
                        청첩장 만들기
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base font-medium">
                        테스트를 위해 <span className="text-rose-500 font-bold">샘플 데이터가 자동 입력</span>되어 있습니다.
                    </p>
                </div>

                <form action={createInvitation} className="space-y-10" onSubmit={() => setLoading(true)}>

                    {/* 1. 신랑 정보 */}
                    <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100 transition-shadow hover:shadow-2xl hover:shadow-slate-200/60">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm">🤵‍♂️</span>
                            <span className="flex-1">신랑 측 정보</span>
                        </h3>

                        <div className="space-y-8">
                            {/* 신랑 본인 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="신랑 성함" name="groom_name" defaultValue="이진호" required icon={<User size={16}/>} />
                                <InputGroup label="신랑 연락처" name="groom_contact" defaultValue="010-1234-5678" type="tel" icon={<MessageCircle size={16}/>} />
                            </div>

                            <AccountGroup
                                label="신랑 계좌"
                                bankName="account_groom_bank"
                                accountNum="account_groom_num"
                                defaultBank="국민은행"
                                defaultNum="123-456-78-9012"
                            />

                            <div className="h-px bg-slate-100 my-4" />

                            {/* 혼주 (부) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="아버지 성함" name="groom_father" defaultValue="이정훈" icon={<Users size={16}/>} />
                                <InputGroup label="아버지 연락처" name="groom_father_contact" defaultValue="010-1111-2222" type="tel" icon={<MessageCircle size={16}/>} />
                            </div>
                            <AccountGroup
                                label="아버지 계좌"
                                bankName="account_groom_f_bank"
                                accountNum="account_groom_f_num"
                                defaultBank="신한은행"
                                defaultNum="110-123-456789"
                            />

                            <div className="h-px bg-slate-100 my-4" />

                            {/* 혼주 (모) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="어머니 성함" name="groom_mother" defaultValue="김현숙" icon={<Users size={16}/>} />
                                <InputGroup label="어머니 연락처" name="groom_mother_contact" defaultValue="010-3333-4444" type="tel" icon={<MessageCircle size={16}/>} />
                            </div>
                            <AccountGroup
                                label="어머니 계좌"
                                bankName="account_groom_m_bank"
                                accountNum="account_groom_m_num"
                                defaultBank="농협"
                                defaultNum="356-1234-5678-93"
                            />
                        </div>
                    </section>

                    {/* 2. 신부 정보 */}
                    <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100 transition-shadow hover:shadow-2xl hover:shadow-slate-200/60">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                            <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm">👰‍♀️</span>
                            <span className="flex-1">신부 측 정보</span>
                        </h3>

                        <div className="space-y-8">
                            {/* 신부 본인 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="신부 성함" name="bride_name" defaultValue="박나은" required icon={<User size={16}/>} />
                                <InputGroup label="신부 연락처" name="bride_contact" defaultValue="010-9876-5432" type="tel" icon={<MessageCircle size={16}/>} />
                            </div>
                            <AccountGroup
                                label="신부 계좌"
                                bankName="account_bride_bank"
                                accountNum="account_bride_num"
                                defaultBank="우리은행"
                                defaultNum="1002-123-456789"
                            />

                            <div className="h-px bg-slate-100 my-4" />

                            {/* 혼주 (부) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="아버지 성함" name="bride_father" defaultValue="박서준" icon={<Users size={16}/>} />
                                <InputGroup label="아버지 연락처" name="bride_father_contact" defaultValue="010-5555-6666" type="tel" icon={<MessageCircle size={16}/>} />
                            </div>
                            <AccountGroup
                                label="아버지 계좌"
                                bankName="account_bride_f_bank"
                                accountNum="account_bride_f_num"
                                defaultBank="기업은행"
                                defaultNum="010-1234-5678"
                            />

                            <div className="h-px bg-slate-100 my-4" />

                            {/* 혼주 (모) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="어머니 성함" name="bride_mother" defaultValue="최영희" icon={<Users size={16}/>} />
                                <InputGroup label="어머니 연락처" name="bride_mother_contact" defaultValue="010-7777-8888" type="tel" icon={<MessageCircle size={16}/>} />
                            </div>
                            <AccountGroup
                                label="어머니 계좌"
                                bankName="account_bride_m_bank"
                                accountNum="account_bride_m_num"
                                defaultBank="카카오뱅크"
                                defaultNum="3333-01-1234567"
                            />
                        </div>
                    </section>

                    {/* 3. 예식 및 교통 정보 */}
                    <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">📅</span>
                            <span className="flex-1">예식 및 초대글</span>
                        </h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup
                                    label="예식 일시"
                                    name="wedding_date"
                                    type="datetime-local"
                                    defaultValue="2026-12-27T12:30" // [중요] 날짜 포맷은 YYYY-MM-DDThh:mm 형태여야 합니다.
                                    required
                                />
                                <InputGroup label="예식장 이름" name="location_name" defaultValue="더채플앳청담" required icon={<Heart size={16}/>} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="상세 홀 이름" name="location_detail" defaultValue="3층 커티지홀" icon={<MapPin size={16}/>} />
                                <InputGroup label="주소 (지도 표시용)" name="location_address" defaultValue="서울 강남구 선릉로 757" required icon={<MapPin size={16}/>} />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">초대 문구</label>
                                <textarea
                                    name="welcome_msg"
                                    rows={6}
                                    defaultValue={`서로가 마주 보며 다진 약속을\n이제 여러분 앞에서 소중히 맺으려 합니다.\n저희의 새로운 시작을 위해\n따뜻한 축복을 보내주시면 감사하겠습니다.`}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none bg-slate-50 text-sm leading-relaxed text-slate-800 resize-none"
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-100 space-y-6">
                                <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
                                    <Car size={18} className="text-slate-400"/> 오시는 길 안내
                                </h4>

                                <TextAreaGroup
                                    label="지하철 안내"
                                    name="transport_subway"
                                    defaultValue="7호선, 수인분당선 강남구청역 3-1번 출구에서 500m (도보 8분)"
                                />
                                <TextAreaGroup
                                    label="버스 안내"
                                    name="transport_bus"
                                    defaultValue="강남구청, 강남세무서 정류장 하차 (간선: 301, 342 / 지선: 3011)"
                                />
                                <TextAreaGroup
                                    label="주차 안내"
                                    name="transport_parking"
                                    defaultValue="웨딩홀 내 200대 주차 가능 (하객 2시간 무료)"
                                />
                            </div>
                        </div>
                    </section>

                    {/* 4. 인터뷰 */}
                    <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                            <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shadow-sm">🎤</span>
                            <span className="flex-1">신랑신부 인터뷰</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-6 rounded-[1.5rem] space-y-3 border border-slate-100">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Question 01</label>
                                <input name="interview_q1" defaultValue="서로의 첫 만남은?" className="w-full bg-transparent font-bold text-slate-800 border-b border-slate-200 focus:border-purple-500 focus:outline-none pb-2 transition-colors" />
                                <textarea name="interview_a1" rows={3} defaultValue="벚꽃이 흩날리던 어느 봄날이었습니다. 수줍게 웃던 모습에 이끌려 오늘까지 오게 되었네요." className="w-full bg-white p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-200" />
                            </div>

                            <div className="bg-slate-50 p-6 rounded-[1.5rem] space-y-3 border border-slate-100">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Question 02</label>
                                <input name="interview_q2" defaultValue="서로에게 바라는 점?" className="w-full bg-transparent font-bold text-slate-800 border-b border-slate-200 focus:border-purple-500 focus:outline-none pb-2 transition-colors" />
                                <textarea name="interview_a2" rows={3} defaultValue="지금처럼 서로를 아끼고 웃음 가득한 예쁜 가정을 함께 만들어가고 싶어요." className="w-full bg-white p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-200" />
                            </div>
                        </div>
                    </section>

                    {/* 5. 사진 업로드 */}
                    <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                            <span className="w-10 h-10 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shadow-sm">📷</span>
                            <span className="flex-1">사진 등록</span>
                        </h3>

                        <div className="space-y-6">
                            <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <Upload size={20} />
                                    </div>
                                    <label className="text-base font-bold text-slate-700 cursor-pointer">메인 사진 (1장)</label>
                                    <p className="text-xs text-slate-400">청첩장 최상단에 들어갈 사진입니다.<br/>세로로 긴 사진을 추천합니다.</p>
                                </div>
                                {/* 파일은 보안상 value를 미리 넣을 수 없습니다. 테스트 시 직접 선택해주세요. */}
                                <input name="mainImage" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>

                            <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <Upload size={20} />
                                    </div>
                                    <label className="text-base font-bold text-slate-700 cursor-pointer">갤러리 사진 (여러 장)</label>
                                    <p className="text-xs text-slate-400">최대 20장까지 선택 가능합니다.<br/>드래그하여 순서를 확인하세요.</p>
                                </div>
                                <input name="galleryImages" type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                        </div>
                    </section>

                    {/* 제출 버튼 */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 bg-slate-900 text-white rounded-3xl font-bold text-xl shadow-2xl shadow-slate-900/30 hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    생성 중입니다...
                                </>
                            ) : (
                                <>
                                    청첩장 만들기 완료 <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                        <p className="text-center text-slate-400 text-xs mt-6 font-medium">
                            * 생성된 청첩장은 고유 주소를 통해 언제든 확인 가능합니다.
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
}

// 재사용 컴포넌트들 수정 (defaultValue 지원)

interface InputGroupProps {
    label: string;
    name: string;
    defaultValue?: string; // value로 변경
    required?: boolean;
    type?: string;
    icon?: React.ReactNode;
}

function InputGroup({ label, name, defaultValue, required = false, type = "text", icon }: InputGroupProps) {
    return (
        <div className="space-y-2 group">
            <label className="block text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                {icon && <span className="text-slate-400 group-focus-within:text-slate-800 transition-colors">{icon}</span>}
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <input
                required={required}
                name={name}
                type={type}
                defaultValue={defaultValue} // placeholder 대신 defaultValue 사용
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none bg-slate-50 text-sm font-medium text-slate-800"
            />
        </div>
    );
}

function TextAreaGroup({ label, name, defaultValue }: { label: string, name: string, defaultValue?: string }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">{label}</label>
            <textarea
                name={name}
                rows={2}
                defaultValue={defaultValue}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none bg-slate-50 text-sm resize-none text-slate-800"
            />
        </div>
    );
}

function AccountGroup({ label, bankName, accountNum, defaultBank, defaultNum }: { label: string, bankName: string, accountNum: string, defaultBank?: string, defaultNum?: string }) {
    return (
        <div className="bg-slate-50 p-5 rounded-[1.5rem] space-y-3 border border-slate-100">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                <CreditCard size={14}/> {label}
            </label>
            <div className="grid grid-cols-3 gap-3">
                <input
                    name={bankName}
                    defaultValue={defaultBank}
                    className="col-span-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none bg-white text-sm text-center font-medium text-slate-800"
                />
                <input
                    name={accountNum}
                    defaultValue={defaultNum}
                    className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none bg-white text-sm font-medium text-slate-800"
                />
            </div>
        </div>
    );
}