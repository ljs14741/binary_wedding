// app/edit/[id]/page.tsx
import { getInvitationById, updateInvitation } from "@/app/actions";
import { notFound } from "next/navigation";
import { Upload, Calendar, MapPin, Heart, Car, MessageCircle, CreditCard, User, Users, ChevronRight, Save } from "lucide-react";

// Server Component (비동기로 DB 데이터 먼저 가져옴)
export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getInvitationById(id);

    if (!data) return notFound();

    // 날짜 포맷팅 (datetime-local input에 넣기 위해 YYYY-MM-DDThh:mm 형식으로 변환)
    const formatDate = (date: Date) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] py-12 px-4 font-sans selection:bg-blue-100">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-blue-600 font-bold tracking-widest text-xs uppercase bg-blue-50 px-3 py-1 rounded-full">Edit Mode</span>
                    <h1 className="text-4xl font-serif font-bold text-slate-900">청첩장 수정하기</h1>
                </div>

                <form action={updateInvitation} className="space-y-10">
                    {/* 식별자 (수정 시 필수) */}
                    <input type="hidden" name="url_id" value={data.url_id} />

                    {/* 신랑 정보 */}
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white ring-1 ring-slate-100">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm">🤵‍♂️</span>
                            <span className="flex-1">신랑 측 정보</span>
                        </h3>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="신랑 성함" name="groom_name" defaultValue={data.groom_name} required icon={<User size={16}/>} />
                                <InputGroup label="신랑 연락처" name="groom_contact" defaultValue={data.groom_contact || ""} type="tel" icon={<MessageCircle size={16}/>} />
                            </div>
                            <div className="h-px bg-slate-100 my-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="아버지 성함" name="groom_father" defaultValue={data.groom_father || ""} icon={<Users size={16}/>} />
                                <InputGroup label="아버지 연락처" name="groom_father_contact" defaultValue={data.groom_father_contact || ""} type="tel" icon={<MessageCircle size={16}/>} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="어머니 성함" name="groom_mother" defaultValue={data.groom_mother || ""} icon={<Users size={16}/>} />
                                <InputGroup label="어머니 연락처" name="groom_mother_contact" defaultValue={data.groom_mother_contact || ""} type="tel" icon={<MessageCircle size={16}/>} />
                            </div>
                        </div>
                    </section>

                    {/* 신부 정보 */}
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white ring-1 ring-slate-100">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                            <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm">👰‍♀️</span>
                            <span className="flex-1">신부 측 정보</span>
                        </h3>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="신부 성함" name="bride_name" defaultValue={data.bride_name} required icon={<User size={16}/>} />
                                <InputGroup label="신부 연락처" name="bride_contact" defaultValue={data.bride_contact || ""} type="tel" icon={<MessageCircle size={16}/>} />
                            </div>
                            <div className="h-px bg-slate-100 my-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="아버지 성함" name="bride_father" defaultValue={data.bride_father || ""} icon={<Users size={16}/>} />
                                <InputGroup label="아버지 연락처" name="bride_father_contact" defaultValue={data.bride_father_contact || ""} type="tel" icon={<MessageCircle size={16}/>} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="어머니 성함" name="bride_mother" defaultValue={data.bride_mother || ""} icon={<Users size={16}/>} />
                                <InputGroup label="어머니 연락처" name="bride_mother_contact" defaultValue={data.bride_mother_contact || ""} type="tel" icon={<MessageCircle size={16}/>} />
                            </div>
                        </div>
                    </section>

                    {/* 예식 정보 */}
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white ring-1 ring-slate-100">
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
                                    defaultValue={formatDate(data.wedding_date)} // 날짜 변환 적용
                                    required
                                />
                                <InputGroup label="예식장 이름" name="location_name" defaultValue={data.location_name} required icon={<Heart size={16}/>} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="상세 홀 이름" name="location_detail" defaultValue={data.location_detail || ""} icon={<MapPin size={16}/>} />
                                <InputGroup label="주소" name="location_address" defaultValue={data.location_address} required icon={<MapPin size={16}/>} />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">초대 문구</label>
                                <textarea name="welcome_msg" rows={6} defaultValue={data.welcome_msg || ""} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 outline-none bg-slate-50 text-sm resize-none" />
                            </div>
                            <div className="pt-6 border-t border-slate-100 space-y-6">
                                <TextAreaGroup label="지하철 안내" name="transport_subway" defaultValue={data.transport_subway || ""} />
                                <TextAreaGroup label="버스 안내" name="transport_bus" defaultValue={data.transport_bus || ""} />
                                <TextAreaGroup label="주차 안내" name="transport_parking" defaultValue={data.transport_parking || ""} />
                            </div>
                        </div>
                    </section>

                    {/* 사진 수정 (선택사항) */}
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white ring-1 ring-slate-100">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                            <span className="w-10 h-10 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shadow-sm">📷</span>
                            <span className="flex-1">사진 수정 (선택)</span>
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">메인 사진 변경</label>
                                <input name="mainImage" type="file" accept="image/*" className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
                                <p className="text-xs text-slate-400 mt-1">* 파일을 선택하지 않으면 기존 사진이 유지됩니다.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">갤러리 사진 변경 (전체 교체)</label>
                                <input name="galleryImages" type="file" multiple accept="image/*" className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
                                <p className="text-xs text-slate-400 mt-1">* 새 사진을 올리면 기존 갤러리 사진은 모두 삭제되고 새로 등록됩니다.</p>
                            </div>
                        </div>
                    </section>

                    <div className="pt-6 pb-20">
                        <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-3xl font-bold text-xl shadow-2xl hover:bg-blue-700 transition-all flex justify-center items-center gap-3">
                            <Save size={20} /> 수정 완료하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// 재사용 컴포넌트 (MakePage와 동일)
function InputGroup({ label, name, defaultValue, required = false, type = "text", icon }: any) {
    return (
        <div className="space-y-2 group">
            <label className="block text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                {icon && <span className="text-slate-400 group-focus-within:text-slate-800 transition-colors">{icon}</span>}
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <input required={required} name={name} type={type} defaultValue={defaultValue} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none bg-slate-50 text-sm font-medium text-slate-800" />
        </div>
    );
}

function TextAreaGroup({ label, name, defaultValue }: any) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">{label}</label>
            <textarea name={name} rows={2} defaultValue={defaultValue} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none bg-slate-50 text-sm resize-none text-slate-800" />
        </div>
    );
}