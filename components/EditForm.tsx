"use client";

import { updateInvitation } from "@/app/actions";
import { useToast } from "@/components/ui/ToastProvider";
import { useState, useEffect, useRef } from "react";
import {
    Upload, Calendar, MapPin, Heart, Car, MessageCircle, CreditCard,
    User, Users, ChevronRight, Image as ImageIcon, X, ChevronLeft, Save, Share2, Trash2
} from "lucide-react";
import { processImage } from "@/lib/image";
import Script from "next/script";

interface EditFormProps {
    initialData: any;
}

export default function EditForm({ initialData }: EditFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // --------------------------------------------------------
    // 1. 사진 상태 관리 (메인, 중간, 갤러리)
    // --------------------------------------------------------
    const [mainFiles, setMainFiles] = useState<File[]>([]);
    const [mainPreviews, setMainPreviews] = useState<string[]>([]);
    const mainInputRef = useRef<HTMLInputElement>(null);
    const addMainInputRef = useRef<HTMLInputElement>(null);

    const [middlePreview, setMiddlePreview] = useState<string | null>(null);
    const middleInputRef = useRef<HTMLInputElement>(null);

    const [ogPreview, setOgPreview] = useState<string | null>(null);
    const ogInputRef = useRef<HTMLInputElement>(null);

    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const addGalleryInputRef = useRef<HTMLInputElement>(null);

    // 기존 데이터 파싱
    const existingMainPhotos = initialData.main_photo_url ? JSON.parse(initialData.main_photo_url) : [];
    const existingMiddlePhoto = initialData.middle_photo_url;
    const existingOgPhoto = initialData.og_photo_url;
    const existingGalleryPhotos = initialData.gallery || [];

    // [데이터 매핑 헬퍼]
    const getAccount = (side: string) => initialData.accounts?.find((acc: any) => acc.side === side);
    const getInterview = (idx: number) => initialData.interviews?.[idx] || { question: "", answer: "" };

    // ① 파일 동기화 (이미지_ce9b5d.png 에러 해결 버전)
    useEffect(() => {
        const syncFiles = (ref: React.RefObject<HTMLInputElement | null>, files: File[]) => {
            if (ref.current) {
                const dt = new DataTransfer();
                files.forEach(f => dt.items.add(f));
                ref.current.files = dt.files;
            }
        };
        syncFiles(mainInputRef, mainFiles);
        syncFiles(galleryInputRef, galleryFiles);
    }, [mainFiles, galleryFiles]);

    // --------------------------------------------------------
    // 2. 이미지 처리 핸들러 (리사이징 적용)
    // --------------------------------------------------------
    const handleMainChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        if (files.length > 3) {
            toast("메인 슬라이드는 최대 3장입니다. 처음 3장만 적용됩니다.");
        }
        const processed = await Promise.all(Array.from(files).slice(0, 3).map(f => processImage(f)));
        updateMainState(processed);
    };

    const handleMainAppend = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const toAdd = Math.min(files.length, 3 - mainFiles.length);
        if (toAdd <= 0) {
            toast("메인 슬라이드는 최대 3장입니다.");
            e.target.value = "";
            return;
        }
        if (files.length > toAdd) {
            toast(`메인 슬라이드는 최대 3장입니다. 필요한 ${toAdd}장만 적용됩니다.`);
        }
        const selected = Array.from(files).slice(0, toAdd);
        const processed = await Promise.all(selected.map(f => processImage(f)));
        updateMainState([...mainFiles, ...processed]);
        e.target.value = "";
    };

    const updateMainState = (files: File[]) => {
        setMainFiles(files);
        mainPreviews.forEach(u => URL.revokeObjectURL(u));
        setMainPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const handleMiddleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const processed = await processImage(file);
            if (middlePreview) URL.revokeObjectURL(middlePreview);
            setMiddlePreview(URL.createObjectURL(processed));
            if (middleInputRef.current) {
                const dt = new DataTransfer();
                dt.items.add(processed);
                middleInputRef.current.files = dt.files;
            }
        } catch (err) {
            console.error("이미지 처리 오류:", err);
            toast("이미지 처리 중 문제가 발생했습니다.");
        }
    };

    const handleOgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const processed = await processImage(file);
            if (ogPreview) URL.revokeObjectURL(ogPreview);
            setOgPreview(URL.createObjectURL(processed));
            if (ogInputRef.current) {
                const dt = new DataTransfer();
                dt.items.add(processed);
                ogInputRef.current.files = dt.files;
            }
        } catch (err) {
            console.error("이미지 처리 오류:", err);
            toast("이미지 처리 중 문제가 발생했습니다.");
        }
    };

    const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        if (files.length > 20) {
            toast("갤러리는 최대 20장입니다. 처음 20장만 적용됩니다.");
        }
        const processed = await Promise.all(Array.from(files).slice(0, 20).map(f => processImage(f)));
        updateGalleryState(processed);
    };

    const handleGalleryAppend = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const canAdd = 20 - galleryFiles.length;
        if (canAdd <= 0) {
            toast("갤러리는 최대 20장입니다.");
            e.target.value = "";
            return;
        }
        if (files.length > canAdd) {
            toast(`갤러리는 최대 20장입니다. ${canAdd}장만 추가됩니다.`);
        }
        const toProcess = Array.from(files).slice(0, canAdd);
        const processed = await Promise.all(toProcess.map(f => processImage(f)));
        const updated = [...galleryFiles, ...processed];
        updateGalleryState(updated);
        if (galleryInputRef.current) {
            const dt = new DataTransfer();
            updated.forEach(f => dt.items.add(f));
            galleryInputRef.current.files = dt.files;
        }
        e.target.value = "";
    };

    const updateGalleryState = (files: File[]) => {
        setGalleryFiles(files);
        galleryPreviews.forEach(u => URL.revokeObjectURL(u));
        setGalleryPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const moveMainFile = (idx: number, dir: 'left'|'right') => {
        const newFiles = [...mainFiles];
        if (dir === 'left' && idx > 0) [newFiles[idx], newFiles[idx-1]] = [newFiles[idx-1], newFiles[idx]];
        else if (dir === 'right' && idx < newFiles.length-1) [newFiles[idx], newFiles[idx+1]] = [newFiles[idx+1], newFiles[idx]];
        updateMainState(newFiles);
    };
    const removeMainFile = (idx: number) => updateMainState(mainFiles.filter((_, i) => i !== idx));
    const clearAllMainFiles = () => updateMainState([]);

    const clearMiddleFile = () => {
        if (middlePreview) URL.revokeObjectURL(middlePreview);
        setMiddlePreview(null);
        if (middleInputRef.current) {
            middleInputRef.current.value = "";
            middleInputRef.current.files = new DataTransfer().files;
        }
    };

    const clearOgFile = () => {
        if (ogPreview) URL.revokeObjectURL(ogPreview);
        setOgPreview(null);
        if (ogInputRef.current) {
            ogInputRef.current.value = "";
            ogInputRef.current.files = new DataTransfer().files;
        }
    };

    const clearAllGalleryFiles = () => updateGalleryState([]);

    const moveGalleryFile = (idx: number, dir: 'left'|'right') => {
        const newFiles = [...galleryFiles];
        if (dir === 'left' && idx > 0) [newFiles[idx], newFiles[idx-1]] = [newFiles[idx-1], newFiles[idx]];
        else if (dir === 'right' && idx < newFiles.length-1) [newFiles[idx], newFiles[idx+1]] = [newFiles[idx+1], newFiles[idx]];
        updateGalleryState(newFiles);
    };

    // --------------------------------------------------------
    // 3. 폼 제출 검증
    // --------------------------------------------------------
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        const address = formData.get("location_address") as string;
        if (!address || address.trim() === "") {
            e.preventDefault();
            toast("주소를 입력해주세요. 주소 검색 버튼을 클릭하여 선택해야 합니다.");
            document.getElementsByName("location_address")[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (mainFiles.length > 0 && mainFiles.length < 3) {
            e.preventDefault();
            toast(`메인 사진 교체 시 3장을 모두 새로 등록해야 합니다. (현재 ${mainFiles.length}장)`);
            return;
        }
        setLoading(true);
    };

    // 메모리 정리
    useEffect(() => {
        return () => {
            mainPreviews.forEach(u => URL.revokeObjectURL(u));
            galleryPreviews.forEach(u => URL.revokeObjectURL(u));
            if (middlePreview) URL.revokeObjectURL(middlePreview);
            if (ogPreview) URL.revokeObjectURL(ogPreview);
        };
    }, []);

    return (
        <form action={updateInvitation} className="space-y-10" onSubmit={handleSubmit}>
            <input type="hidden" name="url_id" value={initialData.url_id} />
            <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" />

            {/* 🤵‍♂️ 신랑 정보 */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-white ring-1 ring-slate-100">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b pb-4">
                    <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm">🤵‍♂️</span><span className="flex-1">신랑 측 정보</span>
                </h3>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="신랑 성함" name="groom_name" defaultValue={initialData.groom_name} required icon={<User size={16}/>}/>
                        <PhoneInput label="신랑 연락처" name="groom_contact" defaultValue={initialData.groom_contact} required icon={<MessageCircle size={16}/>}/>
                    </div>
                    <AccountGroup label="신랑 계좌" bankName="account_groom_bank" accountNum="account_groom_num" defaultBank={getAccount("groom")?.bank_name} defaultNum={getAccount("groom")?.account_number} />
                    <div className="h-px bg-slate-100 my-4"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="아버지 성함" name="groom_father" defaultValue={initialData.groom_father} icon={<Users size={16}/>}/>
                        <PhoneInput label="아버지 연락처" name="groom_father_contact" defaultValue={initialData.groom_father_contact} icon={<MessageCircle size={16}/>}/>
                    </div>
                    <AccountGroup label="아버지 계좌" bankName="account_groom_f_bank" accountNum="account_groom_f_num" defaultBank={getAccount("groom_f")?.bank_name} defaultNum={getAccount("groom_f")?.account_number} />
                    <div className="h-px bg-slate-100 my-4"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="어머니 성함" name="groom_mother" defaultValue={initialData.groom_mother} icon={<Users size={16}/>}/>
                        <PhoneInput label="어머니 연락처" name="groom_mother_contact" defaultValue={initialData.groom_mother_contact} icon={<MessageCircle size={16}/>}/>
                    </div>
                    <AccountGroup label="어머니 계좌" bankName="account_groom_m_bank" accountNum="account_groom_m_num" defaultBank={getAccount("groom_m")?.bank_name} defaultNum={getAccount("groom_m")?.account_number} />
                </div>
            </section>

            {/* 👰‍♀️ 신부 정보 */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-white ring-1 ring-slate-100">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b pb-4">
                    <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm">👰‍♀️</span><span className="flex-1">신부 측 정보</span>
                </h3>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="신부 성함" name="bride_name" defaultValue={initialData.bride_name} required icon={<User size={16}/>}/>
                        <PhoneInput label="신부 연락처" name="bride_contact" defaultValue={initialData.bride_contact} required icon={<MessageCircle size={16}/>}/>
                    </div>
                    <AccountGroup label="신부 계좌" bankName="account_bride_bank" accountNum="account_bride_num" defaultBank={getAccount("bride")?.bank_name} defaultNum={getAccount("bride")?.account_number} />
                    <div className="h-px bg-slate-100 my-4"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="아버지 성함" name="bride_father" defaultValue={initialData.bride_father} icon={<Users size={16}/>}/>
                        <PhoneInput label="아버지 연락처" name="bride_father_contact" defaultValue={initialData.bride_father_contact} icon={<MessageCircle size={16}/>}/>
                    </div>
                    <AccountGroup label="아버지 계좌" bankName="account_bride_f_bank" accountNum="account_bride_f_num" defaultBank={getAccount("bride_f")?.bank_name} defaultNum={getAccount("bride_f")?.account_number} />
                    <div className="h-px bg-slate-100 my-4"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="어머니 성함" name="bride_mother" defaultValue={initialData.bride_mother} icon={<Users size={16}/>}/>
                        <PhoneInput label="어머니 연락처" name="bride_mother_contact" defaultValue={initialData.bride_mother_contact} icon={<MessageCircle size={16}/>}/>
                    </div>
                    <AccountGroup label="어머니 계좌" bankName="account_bride_m_bank" accountNum="account_bride_m_num" defaultBank={getAccount("bride_m")?.bank_name} defaultNum={getAccount("bride_m")?.account_number} />
                </div>
            </section>

            {/* 📅 예식 및 초대글 */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-white ring-1 ring-slate-100">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b pb-4">
                    <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">📅</span><span className="flex-1">예식 및 초대글</span>
                </h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="예식 일시" name="wedding_date" type="datetime-local" defaultValue={initialData.wedding_date} required />
                        <InputGroup label="예식장 이름" name="location_name" defaultValue={initialData.location_name} required icon={<Heart size={16}/>}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="상세 홀 이름" name="location_detail" defaultValue={initialData.location_detail} icon={<MapPin size={16}/>}/>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 ml-1">주소 (지도 표시용) <span className="text-rose-500">*</span></label>
                            <input
                                required name="location_address" readOnly defaultValue={initialData.location_address}
                                onClick={() => {
                                    new (window as any).daum.Postcode({
                                        oncomplete: function (data: any) {
                                            const fullAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                                            (document.getElementsByName("location_address")[0] as HTMLInputElement).value = fullAddr;
                                        }
                                    }).open();
                                }}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 cursor-pointer bg-slate-50 text-sm font-medium text-slate-800 outline-none hover:bg-white transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 ml-1">초대 문구</label>
                        <textarea name="welcome_msg" rows={6} defaultValue={initialData.welcome_msg} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm leading-relaxed text-slate-800 outline-none focus:ring-1 focus:ring-slate-800 resize-none"/>
                    </div>
                    <div className="pt-6 border-t border-slate-100 space-y-6">
                        <h4 className="font-bold text-base text-slate-800 flex items-center gap-2"><Car size={18} className="text-slate-400"/> 오시는 길 안내</h4>
                        <TextAreaGroup label="지하철 안내" name="transport_subway" defaultValue={initialData.transport_subway}/>
                        <TextAreaGroup label="버스 안내" name="transport_bus" defaultValue={initialData.transport_bus}/>
                        <TextAreaGroup label="주차 안내" name="transport_parking" defaultValue={initialData.transport_parking}/>
                    </div>
                </div>
            </section>

            {/* 🎤 인터뷰 섹션 */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-white ring-1 ring-slate-100">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b pb-4">
                    <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shadow-sm">🎤</span><span className="flex-1">신랑신부 인터뷰</span>
                </h3>
                <p className="text-xs text-slate-500 mb-6">질문과 답변 모두 수정할 수 있습니다.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((num, idx) => (
                        <div key={num} className="bg-slate-50 p-6 rounded-[1.5rem] space-y-3 border border-slate-100">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">질문 0{num}</label>
                            <input name={`interview_q${num}`} defaultValue={getInterview(idx).question} placeholder="질문을 입력하세요" className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-200 transition-colors"/>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">답변</label>
                            <textarea name={`interview_a${num}`} rows={3} defaultValue={getInterview(idx).answer} placeholder="답변을 입력하세요" className="w-full bg-white p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-200"/>
                        </div>
                    ))}
                </div>
            </section>

            {/* 📷 사진 수정 섹션 */}
            <section id="photo-section" className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-white ring-1 ring-slate-100">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b pb-4">
                    <span className="w-10 h-10 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shadow-sm">📷</span><span className="flex-1">사진 수정</span>
                </h3>
                <div className="space-y-12">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="text-base font-bold text-slate-700">메인 슬라이드 사진 <span className="text-rose-500 text-sm">(3장 필수)</span></label>
                            <div className="flex items-center gap-2">
                                {mainPreviews.length === 0 ? <span className="text-[11px] text-blue-500 bg-blue-50 px-2 py-1 rounded-full font-bold">기존 유지 중</span> : <span className="text-[11px] text-rose-500 bg-rose-50 px-2 py-1 rounded-full font-bold">변경 모드</span>}
                                {mainPreviews.length > 0 && (
                                    <button type="button" onClick={clearAllMainFiles} className="text-[11px] text-rose-500 bg-rose-50 px-2 py-1 rounded-full font-bold hover:bg-rose-100 flex items-center gap-1">
                                        <Trash2 size={12}/> 전부 삭제
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">권장: 9:16 비율 / 1장당 15MB 이하 · 화살표로 순서 변경 가능</p>
                        {mainPreviews.length === 0 && existingMainPhotos.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border">
                                {existingMainPhotos.map((src: string, i: number) => (
                                    <div key={i} className="relative aspect-[9/16] rounded-xl overflow-hidden border shadow-sm">
                                        <img src={src} className="w-full h-full object-cover" alt="current" />
                                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full font-bold">기존 {i+1}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl min-h-[280px] flex flex-col items-center justify-center p-4 hover:bg-slate-50 transition-all overflow-hidden">
                            {mainPreviews.length > 0 ? (
                                <div className="absolute inset-0 z-10 bg-white flex items-center justify-center p-4 overflow-auto">
                                    <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                                        {mainPreviews.map((src, idx) => (
                                            <div key={idx} className="relative aspect-[9/16] rounded-2xl overflow-hidden border shadow-lg group/item min-w-0">
                                                <img src={src} className="w-full h-full object-cover" alt="new"/>
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 flex justify-between items-center opacity-0 group-hover/item:opacity-100 transition-opacity z-20">
                                                    <button type="button" onClick={() => moveMainFile(idx, 'left')} disabled={idx === 0} className="p-1 text-white hover:bg-white/20 rounded-full"><ChevronLeft size={16}/></button>
                                                    <button type="button" onClick={() => removeMainFile(idx)} className="p-1 text-rose-400 hover:bg-white/20 rounded-full"><X size={16}/></button>
                                                    <button type="button" onClick={() => moveMainFile(idx, 'right')} disabled={idx === mainPreviews.length-1} className="p-1 text-white hover:bg-white/20 rounded-full"><ChevronRight size={16}/></button>
                                                </div>
                                            </div>
                                        ))}
                                        {mainFiles.length < 3 && <div className="aspect-[9/16] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-2 cursor-pointer min-w-0" onClick={() => addMainInputRef.current?.click()}><Upload size={24}/><span className="text-xs font-bold">추가</span></div>}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-1">
                                    <Upload size={24} className="mx-auto text-slate-300 mb-2"/>
                                    <p className="text-xs text-slate-400 font-bold text-center">사진을 교체하려면 클릭 (3장 필수)</p>
                                    <p className="text-[11px] text-slate-400">권장: 9:16 비율 / 1장당 15MB 이하</p>
                                </div>
                            )}
                            <input name="mainImages" ref={mainInputRef} type="file" multiple accept="image/*" onChange={handleMainChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                            <input ref={addMainInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleMainAppend} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="text-base font-bold text-slate-700">초대장 대표 사진 <span className="text-rose-500 text-sm">(1장 필수)</span></label>
                            {middlePreview && (
                                <button type="button" onClick={clearMiddleFile} className="text-[11px] text-rose-500 bg-rose-50 px-2 py-1 rounded-full font-bold hover:bg-rose-100 flex items-center gap-1">
                                    <Trash2 size={12}/> 삭제
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">권장: 1:1 비율 (정방형) / 1장당 15MB 이하</p>
                        {!middlePreview && existingMiddlePhoto && (
                            <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border mb-4 shadow-inner">
                                <img src={existingMiddlePhoto} className="w-40 h-40 rounded-xl object-cover shadow-md" alt="current middle" />
                            </div>
                        )}
                        <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl min-h-[240px] flex flex-col items-center justify-center p-4 hover:bg-slate-50 transition-all overflow-hidden">
                            {middlePreview ? (
                                <>
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2">
                                        <img src={middlePreview} className="w-40 h-40 rounded-xl object-cover shadow-lg" alt="new middle"/>
                                        <p className="text-xs text-slate-500">클릭하면 변경</p>
                                    </div>
                                    <button type="button" onClick={clearMiddleFile} className="absolute bottom-4 right-4 z-30 text-[11px] text-rose-500 bg-rose-50 px-2 py-1 rounded-full font-bold hover:bg-rose-100">
                                        삭제
                                    </button>
                                </>
                            ) : <ImageIcon size={24} className="text-slate-300" />}
                            <input name="middleImage" ref={middleInputRef} type="file" accept="image/*" onChange={handleMiddleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"/>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <Share2 size={18} className="text-slate-500" />
                                <label className="text-base font-bold text-slate-700">카톡 공유용 이미지</label>
                                <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full font-bold">선택</span>
                            </div>
                            {ogPreview && (
                                <button type="button" onClick={clearOgFile} className="text-[11px] text-rose-500 bg-rose-50 px-2 py-1 rounded-full font-bold hover:bg-rose-100 flex items-center gap-1">
                                    <Trash2 size={12}/> 삭제
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            청첩장 링크를 카톡으로 보낼 때 미리보기로 나올 사진입니다. 따로 올리지 않으면 1:1 대표사진이 사용됩니다. <span className="text-amber-600 font-medium">1:1은 가운데 위주로 나와서 조금 짤릴 수 있습니다.</span> 최적 표시를 원하면 1200×630 비율로 업로드하세요. <span className="text-rose-500 font-bold">1장당 15MB 이하</span>
                        </p>
                        {!ogPreview && existingOgPhoto && (
                            <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border mb-2">
                                <img src={existingOgPhoto} className="max-w-[280px] w-full aspect-[1200/630] rounded-xl object-cover shadow-md" alt="current og" />
                            </div>
                        )}
                        <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl min-h-[200px] flex flex-col items-center justify-center p-4 hover:bg-slate-50 transition-all cursor-pointer overflow-hidden">
                            {ogPreview ? (
                                <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center p-4">
                                    <div className="relative max-w-[280px] w-full aspect-[1200/630] rounded-xl overflow-hidden border shadow-sm">
                                        <img src={ogPreview} className="w-full h-full object-cover" alt="new og"/>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500 font-medium">클릭하면 변경</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Share2 size={24} className="text-slate-300" />
                                    <p className="text-xs text-slate-400 font-medium">클릭하여 등록/변경 (1200×630 권장 / 15MB 이하)</p>
                                </div>
                            )}
                            <input name="ogImage" ref={ogInputRef} type="file" accept="image/*" onChange={handleOgChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"/>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="text-base font-bold text-slate-700">웨딩 갤러리 <span className="text-rose-500 text-sm">(1~20장)</span></label>
                            <div className="flex items-center gap-2">
                                {galleryPreviews.length === 0 ? <span className="text-[11px] text-blue-500 bg-blue-50 px-2 py-1 rounded-full font-bold">기존 유지 중</span> : <span className="text-[11px] text-rose-500 bg-rose-50 px-2 py-1 rounded-full font-bold">교체됨</span>}
                                {galleryPreviews.length > 0 && (
                                    <button type="button" onClick={clearAllGalleryFiles} className="text-[11px] text-rose-500 bg-rose-50 px-2 py-1 rounded-full font-bold hover:bg-rose-100 flex items-center gap-1">
                                        <Trash2 size={12}/> 전부 삭제
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">권장: 1:1 비율 (정방형) / 1장당 15MB 이하 · 화살표로 순서 변경 가능</p>
                        {galleryPreviews.length === 0 && existingGalleryPhotos.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto p-4 bg-slate-50 rounded-2xl border shadow-inner">
                                {existingGalleryPhotos.map((src: string, i: number) => (
                                    <div key={i} className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border shadow-sm">
                                        <img src={src} className="w-full h-full object-cover" alt="current gallery" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl min-h-[280px] flex flex-col items-center justify-center p-4 hover:bg-slate-50 transition-all overflow-hidden">
                            {galleryPreviews.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2 w-full h-full p-2">
                                    {galleryPreviews.map((src, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border shadow-md group/item">
                                            <img src={src} className="w-full h-full object-cover" alt="new gallery"/>
                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 flex justify-between opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => moveGalleryFile(i, 'left')} disabled={i === 0} className="text-white p-0.5"><ChevronLeft size={14}/></button>
                                                <button type="button" onClick={() => setGalleryFiles(galleryFiles.filter((_, idx) => idx !== i))} className="text-rose-400 p-0.5"><X size={14}/></button>
                                                <button type="button" onClick={() => moveGalleryFile(i, 'right')} disabled={i === galleryFiles.length-1} className="text-white p-0.5"><ChevronRight size={14}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {galleryFiles.length < 20 && <div onClick={() => addGalleryInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-slate-300 cursor-pointer hover:bg-slate-100"><Upload size={16}/></div>}
                                </div>
                            ) : (
                                <div className="text-center space-y-1">
                                    <Upload size={24} className="mx-auto text-slate-300"/>
                                    <p className="text-xs text-slate-400 font-bold">갤러리 사진 교체 시 클릭</p>
                                    <p className="text-[11px] text-slate-400">권장: 1:1 비율 / 1장당 15MB 이하</p>
                                </div>
                            )}
                            <input name="galleryImages" ref={galleryInputRef} type="file" multiple accept="image/*" onChange={handleGalleryChange} className={`absolute inset-0 w-full h-full cursor-pointer opacity-0 ${galleryPreviews.length > 0 ? 'hidden' : 'block z-20'}`} />
                            <input ref={addGalleryInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryAppend} />
                        </div>
                    </div>
                </div>
            </section>

            <div className="pt-6 pb-20">
                <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-bold text-xl shadow-2xl hover:bg-blue-700 transition-all flex justify-center items-center gap-3 active:scale-[0.98] disabled:opacity-50">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={20} /> 수정 완료하기</>}
                </button>
            </div>
        </form>
    );
}

// ----------------------------------------------------------------------
// 재사용 하위 컴포넌트 (누락 없이 완벽 포함)
// ----------------------------------------------------------------------

function InputGroup({ label, name, defaultValue, required = false, type = "text", icon }: any) {
    return (
        <div className="space-y-2 group">
            <label className="block text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                {icon && <span className="text-slate-400 group-focus-within:text-slate-800 transition-colors">{icon}</span>}
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <input required={required} name={name} type={type} defaultValue={defaultValue} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none bg-slate-50 text-sm font-medium text-slate-800 transition-all" />
        </div>
    );
}

function PhoneInput({label, name, defaultValue = "", required = false, icon}: any) {
    const [value, setValue] = useState(defaultValue);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        let formatted = raw;
        if (raw.length > 3 && raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
        else if (raw.length > 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
        setValue(formatted);
    };
    return (
        <div className="space-y-2 group">
            <label className="block text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                {icon && <span className="text-slate-400 group-focus-within:text-slate-800 transition-colors">{icon}</span>}
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <input required={required} name={name} type="tel" value={value} onChange={handleChange} maxLength={13} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 outline-none bg-slate-50 text-sm font-medium text-slate-800" />
        </div>
    );
}

function TextAreaGroup({ label, name, defaultValue }: any) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">{label}</label>
            <textarea name={name} rows={2} defaultValue={defaultValue} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm resize-none text-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all" />
        </div>
    );
}

function AccountGroup({ label, bankName, accountNum, defaultBank, defaultNum }: any) {
    return (
        <div className="bg-slate-50 p-5 rounded-[1.5rem] space-y-3 border border-slate-100">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-2 tracking-wider uppercase"><CreditCard size={14}/> {label}</label>
            <div className="grid grid-cols-3 gap-3">
                <input name={bankName} defaultValue={defaultBank} placeholder="은행명" className="col-span-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-center font-bold outline-none focus:ring-1 focus:ring-slate-800" />
                <input name={accountNum} defaultValue={defaultNum} placeholder="계좌번호" className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:ring-1 focus:ring-slate-800" />
            </div>
        </div>
    );
}