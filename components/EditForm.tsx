"use client";

import { updateInvitation } from "@/app/actions";
import { useState, useEffect, useRef } from "react";
import { Upload, Calendar, MapPin, Heart, Car, MessageCircle, CreditCard, User, Users, ChevronRight, AlertCircle, Image as ImageIcon, X, ChevronLeft, Save } from "lucide-react";

interface EditFormProps {
    initialData: any;
}

export default function EditForm({ initialData }: EditFormProps) {
    const [loading, setLoading] = useState(false);

    // --------------------------------------------------------
    // 1. 메인 사진 상태 (수정 시 새로 올릴 파일들)
    // --------------------------------------------------------
    const [mainFiles, setMainFiles] = useState<File[]>([]);
    const [mainPreviews, setMainPreviews] = useState<string[]>([]);
    const mainInputRef = useRef<HTMLInputElement>(null);
    const addMainInputRef = useRef<HTMLInputElement>(null);

    // 기존 사진 데이터 파싱
    const existingMainPhotos = initialData.main_photo_url ? JSON.parse(initialData.main_photo_url) : [];

    // 파일 동기화
    useEffect(() => {
        if (mainInputRef.current) {
            const dataTransfer = new DataTransfer();
            mainFiles.forEach(file => dataTransfer.items.add(file));
            mainInputRef.current.files = dataTransfer.files;
        }
    }, [mainFiles]);

    const handleMainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const newFiles = Array.from(files).slice(0, 3); // 최대 3장
        // 용량 체크
        for (let i = 0; i < newFiles.length; i++) {
            if (newFiles[i].size > 5 * 1024 * 1024) {
                alert(`"${newFiles[i].name}" 파일 용량이 5MB를 초과합니다.`);
                e.target.value = "";
                return;
            }
        }
        updateMainState(newFiles);
    };

    const handleMainAppend = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const newFile = files[0];
        if (newFile.size > 5 * 1024 * 1024) {
            alert("5MB 이하의 파일만 업로드 가능합니다.");
            e.target.value = "";
            return;
        }
        updateMainState([...mainFiles, newFile]);
        e.target.value = "";
    };

    const updateMainState = (files: File[]) => {
        setMainFiles(files);
        mainPreviews.forEach(url => URL.revokeObjectURL(url));
        setMainPreviews(files.map(file => URL.createObjectURL(file)));
    };

    const moveMainFile = (index: number, direction: 'left' | 'right') => {
        const newFiles = [...mainFiles];
        if (direction === 'left' && index > 0) {
            [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
        } else if (direction === 'right' && index < newFiles.length - 1) {
            [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
        }
        updateMainState(newFiles);
    };

    const removeMainFile = (index: number) => {
        updateMainState(mainFiles.filter((_, i) => i !== index));
    };

    // --------------------------------------------------------
    // 2. 중간(초대장) 사진 상태 - [복구됨]
    // --------------------------------------------------------
    const [middlePreview, setMiddlePreview] = useState<string | null>(null);
    // 기존 중간 사진
    const existingMiddlePhoto = initialData.middle_photo_url;

    const handleMiddleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        if (files[0].size > 5 * 1024 * 1024) {
            alert("5MB 이하의 파일만 업로드 가능합니다.");
            e.target.value = "";
            return;
        }
        if (middlePreview) URL.revokeObjectURL(middlePreview);
        setMiddlePreview(URL.createObjectURL(files[0]));
    };

    // --------------------------------------------------------
    // 3. 갤러리 사진 상태
    // --------------------------------------------------------
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const addGalleryInputRef = useRef<HTMLInputElement>(null);

    // 기존 갤러리 사진
    const existingGalleryPhotos = initialData.gallery || [];

    useEffect(() => {
        if (galleryInputRef.current) {
            const dataTransfer = new DataTransfer();
            galleryFiles.forEach(file => dataTransfer.items.add(file));
            galleryInputRef.current.files = dataTransfer.files;
        }
    }, [galleryFiles]);

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const newFiles = Array.from(files).slice(0, 20);
        for (let i = 0; i < newFiles.length; i++) {
            if (newFiles[i].size > 5 * 1024 * 1024) {
                alert(`"${newFiles[i].name}" 파일 용량이 5MB를 초과합니다.`);
                e.target.value = "";
                return;
            }
        }
        updateGalleryState(newFiles);
    };

    const handleGalleryAppend = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const newFilesArr = Array.from(files);
        for (let i = 0; i < newFilesArr.length; i++) {
            if (newFilesArr[i].size > 5 * 1024 * 1024) {
                alert(`"${newFilesArr[i].name}" 파일이 5MB를 초과합니다.`);
                e.target.value = "";
                return;
            }
        }
        if (galleryFiles.length + newFilesArr.length > 20) {
            alert("갤러리 사진은 최대 20장까지만 등록 가능합니다.");
            e.target.value = "";
            return;
        }
        updateGalleryState([...galleryFiles, ...newFilesArr]);
        e.target.value = "";
    };

    const updateGalleryState = (files: File[]) => {
        setGalleryFiles(files);
        galleryPreviews.forEach(url => URL.revokeObjectURL(url));
        setGalleryPreviews(files.map(file => URL.createObjectURL(file)));
    };

    const moveGalleryFile = (index: number, direction: 'left' | 'right') => {
        const newFiles = [...galleryFiles];
        if (direction === 'left' && index > 0) {
            [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
        } else if (direction === 'right' && index < newFiles.length - 1) {
            [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
        }
        updateGalleryState(newFiles);
    };

    const removeGalleryFile = (index: number) => {
        updateGalleryState(galleryFiles.filter((_, i) => i !== index));
    };

    // 메모리 정리
    useEffect(() => {
        return () => {
            mainPreviews.forEach(u => URL.revokeObjectURL(u));
            galleryPreviews.forEach(u => URL.revokeObjectURL(u));
            if (middlePreview) URL.revokeObjectURL(middlePreview);
        };
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        // [검증] 파일을 1개라도 올렸으면 갯수 조건 충족해야 함
        if (mainFiles.length > 0 && mainFiles.length < 3) {
            e.preventDefault();
            alert(`메인 사진을 변경하시려면 3장을 모두 새로 등록해야 합니다.\n(현재 ${mainFiles.length}장 선택됨)`);
            return;
        }
        // 갤러리나 중간 사진은 필수가 아니거나(유지되므로), 선택 시 제한만 있음.
        setLoading(true);
    };

    return (
        <form action={updateInvitation} className="space-y-10" onSubmit={handleSubmit}>
            <input type="hidden" name="url_id" value={initialData.url_id} />
            <input type="hidden" name="password" value={initialData.password} />

            {/* 1. 신랑 정보 */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                    <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm">🤵‍♂️</span><span className="flex-1">신랑 측 정보</span>
                </h3>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="신랑 성함" name="groom_name" defaultValue={initialData.groom_name} required icon={<User size={16}/>}/>
                        <PhoneInput label="신랑 연락처" name="groom_contact" defaultValue={initialData.groom_contact} required icon={<MessageCircle size={16}/>}/>
                    </div>
                    <div className="h-px bg-slate-100 my-4"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="아버지 성함" name="groom_father" defaultValue={initialData.groom_father} icon={<Users size={16}/>}/>
                        <PhoneInput label="아버지 연락처" name="groom_father_contact" defaultValue={initialData.groom_father_contact} icon={<MessageCircle size={16}/>}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="어머니 성함" name="groom_mother" defaultValue={initialData.groom_mother} icon={<Users size={16}/>}/>
                        <PhoneInput label="어머니 연락처" name="groom_mother_contact" defaultValue={initialData.groom_mother_contact} icon={<MessageCircle size={16}/>}/>
                    </div>
                </div>
            </section>

            {/* 2. 신부 정보 */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                    <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm">👰‍♀️</span><span className="flex-1">신부 측 정보</span>
                </h3>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="신부 성함" name="bride_name" defaultValue={initialData.bride_name} required icon={<User size={16}/>}/>
                        <PhoneInput label="신부 연락처" name="bride_contact" defaultValue={initialData.bride_contact} required icon={<MessageCircle size={16}/>}/>
                    </div>
                    <div className="h-px bg-slate-100 my-4"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="아버지 성함" name="bride_father" defaultValue={initialData.bride_father} icon={<Users size={16}/>}/>
                        <PhoneInput label="아버지 연락처" name="bride_father_contact" defaultValue={initialData.bride_father_contact} icon={<MessageCircle size={16}/>}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="어머니 성함" name="bride_mother" defaultValue={initialData.bride_mother} icon={<Users size={16}/>}/>
                        <PhoneInput label="어머니 연락처" name="bride_mother_contact" defaultValue={initialData.bride_mother_contact} icon={<MessageCircle size={16}/>}/>
                    </div>
                </div>
            </section>

            {/* 3. 예식 및 교통 */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                    <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">📅</span><span className="flex-1">예식 및 초대글</span>
                </h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="예식 일시" name="wedding_date" type="datetime-local" defaultValue={initialData.wedding_date} required />
                        <InputGroup label="예식장 이름" name="location_name" defaultValue={initialData.location_name} required icon={<Heart size={16}/>}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="상세 홀 이름" name="location_detail" defaultValue={initialData.location_detail} icon={<MapPin size={16}/>}/>
                        <InputGroup label="주소 (지도 표시용)" name="location_address" defaultValue={initialData.location_address} required icon={<MapPin size={16}/>}/>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 ml-1">초대 문구</label>
                        <textarea name="welcome_msg" rows={6} defaultValue={initialData.welcome_msg} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none bg-slate-50 text-sm leading-relaxed text-slate-800 resize-none"/>
                    </div>
                    <div className="pt-6 border-t border-slate-100 space-y-6">
                        <TextAreaGroup label="지하철 안내" name="transport_subway" defaultValue={initialData.transport_subway}/>
                        <TextAreaGroup label="버스 안내" name="transport_bus" defaultValue={initialData.transport_bus}/>
                        <TextAreaGroup label="주차 안내" name="transport_parking" defaultValue={initialData.transport_parking}/>
                    </div>
                </div>
            </section>

            {/* 5. 사진 수정 (미리보기 및 교체) */}
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                    <span className="w-10 h-10 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shadow-sm">📷</span>
                    <span className="flex-1">사진 수정</span>
                </h3>

                <div className="space-y-12">
                    {/* [메인 사진] */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-bold text-slate-700">메인 슬라이드 사진</label>
                            {/* 안내 문구 */}
                            {mainPreviews.length === 0 ? (
                                <span className="text-[11px] text-blue-500 bg-blue-50 px-2 py-1 rounded-full font-bold">기존 사진 유지 중</span>
                            ) : (
                                <span className="text-[11px] text-rose-500 bg-rose-50 px-2 py-1 rounded-full font-bold">화살표로 순서 변경 가능</span>
                            )}
                        </div>

                        {/* 기존 사진 프리뷰 (새 사진 없을 때만 표시) */}
                        {mainPreviews.length === 0 && existingMainPhotos.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                {existingMainPhotos.map((src: string, idx: number) => (
                                    <div key={idx} className="relative aspect-[9/16] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                        <img src={src} alt="Current" className="w-full h-full object-cover" />
                                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">기존 {idx+1}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 새 사진 업로드 UI */}
                        <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl min-h-[280px] flex flex-col items-center justify-center p-4 hover:bg-slate-50 hover:border-slate-300 transition-all overflow-hidden">
                            {mainPreviews.length > 0 ? (
                                <div className="absolute inset-0 z-10 bg-white flex items-center justify-center gap-4 p-4">
                                    {mainPreviews.map((src, idx) => (
                                        <div key={idx} className="relative w-1/3 h-full rounded-2xl overflow-hidden border border-slate-100 shadow-lg group/item">
                                            <img src={src} alt={`New Main ${idx}`} className="w-full h-full object-cover"/>
                                            <div className="absolute top-3 left-3 bg-black/70 text-white w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full shadow-md z-20">{idx + 1}</div>
                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 flex justify-between items-center opacity-0 group-hover/item:opacity-100 transition-opacity z-20">
                                                <button type="button" onClick={() => moveMainFile(idx, 'left')} disabled={idx === 0} className="p-1.5 text-white hover:bg-white/20 rounded-full disabled:opacity-30"><ChevronLeft size={16}/></button>
                                                <button type="button" onClick={() => removeMainFile(idx)} className="p-1.5 text-rose-400 hover:bg-white/20 rounded-full"><X size={16}/></button>
                                                <button type="button" onClick={() => moveMainFile(idx, 'right')} disabled={idx === mainPreviews.length - 1} className="p-1.5 text-white hover:bg-white/20 rounded-full disabled:opacity-30"><ChevronRight size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {mainPreviews.length < 3 && (
                                        <div className="relative w-1/3 h-full rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-2 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => addMainInputRef.current?.click()}>
                                            <Upload size={24}/>
                                            <span className="text-xs font-bold">추가하기</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-6 pointer-events-none">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2"><Upload size={20}/></div>
                                    <div className="text-xs text-slate-400 space-y-1 text-center">
                                        <p>사진을 변경하려면 여기를 눌러 새로 선택하세요.</p>
                                        <p className="font-bold text-slate-500">권장: 9:16 비율 / 1장당 5MB 이하</p>
                                        <p className="text-rose-400 font-medium mt-1">※ 주의: 3장을 모두 새로 올려야 합니다.</p>
                                    </div>
                                </div>
                            )}
                            <input name="mainImages" ref={mainInputRef} type="file" multiple accept="image/*" onChange={handleMainChange} className={`absolute inset-0 w-full h-full cursor-pointer opacity-0 ${mainPreviews.length > 0 ? 'hidden' : 'block z-20'}`} />
                        </div>
                        <input ref={addMainInputRef} type="file" accept="image/*" className="hidden" onChange={handleMainAppend} />
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* [중간(초대장) 사진] */}
                    <div className="space-y-4">
                        <label className="text-base font-bold text-slate-700">초대장 대표 사진 변경</label>

                        {/* 기존 사진 프리뷰 (새 사진 없을 때만 표시) */}
                        {!middlePreview && existingMiddlePhoto && (
                            <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
                                <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                    <img src={existingMiddlePhoto} alt="Current Middle" className="w-full h-full object-cover" />
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">현재 사진</div>
                                </div>
                            </div>
                        )}

                        <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl min-h-[280px] flex flex-col items-center justify-center p-4 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer overflow-hidden">
                            {middlePreview ? (
                                <div className="absolute inset-0 z-10 bg-white flex items-center justify-center p-4">
                                    <div className="relative w-full max-w-[200px] h-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm aspect-square">
                                        <img src={middlePreview} alt="Middle" className="w-full h-full object-cover"/>
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="bg-white px-4 py-2 rounded-full text-sm font-bold shadow-lg text-slate-800 flex items-center gap-2"><ImageIcon size={16}/> 사진 변경하기</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-6">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><ImageIcon size={20}/></div>
                                    <div className="text-xs text-slate-400 space-y-1 text-center">
                                        <p>사진을 변경하려면 여기를 클릭하세요.</p>
                                        <p className="font-bold text-slate-500">권장: 1:1 비율 (정방형)</p>
                                    </div>
                                </div>
                            )}
                            <input name="middleImage" type="file" accept="image/*" onChange={handleMiddleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"/>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* [웨딩 갤러리 사진] */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-bold text-slate-700">웨딩 갤러리 사진 변경</label>
                            {galleryPreviews.length === 0 ? (
                                <span className="text-[11px] text-blue-500 bg-blue-50 px-2 py-1 rounded-full font-bold">기존 사진 유지 중</span>
                            ) : (
                                <span className="text-[11px] text-rose-500 bg-rose-50 px-2 py-1 rounded-full font-bold">새로 업로드 시 전체 교체됨</span>
                            )}
                        </div>

                        {/* 기존 갤러리 프리뷰 */}
                        {galleryPreviews.length === 0 && existingGalleryPhotos.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
                                {existingGalleryPhotos.map((src: string, idx: number) => (
                                    <div key={idx} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                                        <img src={src} alt="Current" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl min-h-[280px] flex flex-col items-center justify-center p-4 hover:bg-slate-50 hover:border-slate-300 transition-all overflow-hidden">
                            {galleryPreviews.length > 0 ? (
                                <div className="absolute inset-0 z-10 bg-white p-4 overflow-y-auto">
                                    <div className="grid grid-cols-3 gap-3">
                                        {galleryPreviews.map((src, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm group/item">
                                                <img src={src} alt={`Gallery ${idx}`} className="w-full h-full object-cover"/>
                                                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-20">{idx + 1}</div>
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1.5 flex justify-between items-center opacity-0 group-hover/item:opacity-100 transition-opacity z-20">
                                                    <button type="button" onClick={() => moveGalleryFile(idx, 'left')} disabled={idx === 0} className="p-1 text-white hover:bg-white/20 rounded-full disabled:opacity-30"><ChevronLeft size={14}/></button>
                                                    <button type="button" onClick={() => removeGalleryFile(idx)} className="p-1 text-rose-400 hover:bg-white/20 rounded-full"><X size={14}/></button>
                                                    <button type="button" onClick={() => moveGalleryFile(idx, 'right')} disabled={idx === galleryPreviews.length - 1} className="p-1 text-white hover:bg-white/20 rounded-full disabled:opacity-30"><ChevronRight size={14}/></button>
                                                </div>
                                            </div>
                                        ))}
                                        {galleryPreviews.length < 20 && (
                                            <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-1 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => addGalleryInputRef.current?.click()}>
                                                <Upload size={20}/><span className="text-[10px] font-bold">추가</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-6 pointer-events-none">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2"><Upload size={20}/></div>
                                    <div className="text-xs text-slate-400 space-y-1 text-center">
                                        <p>사진을 변경하려면 여기를 클릭하세요.</p>
                                        <p className="font-bold text-slate-500">권장: 1:1 비율 (정방형) / 1장당 5MB 이하</p>
                                    </div>
                                </div>
                            )}
                            <input name="galleryImages" ref={galleryInputRef} type="file" multiple accept="image/*" onChange={handleGalleryChange} className={`absolute inset-0 w-full h-full cursor-pointer opacity-0 ${galleryPreviews.length > 0 ? 'hidden' : 'block z-20'}`} />
                        </div>
                        <input ref={addGalleryInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryAppend} />
                    </div>
                </div>
            </section>

            <div className="pt-6 pb-20">
                <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-bold text-xl shadow-2xl hover:bg-blue-700 transition-all flex justify-center items-center gap-3">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={20} /> 수정 완료하기</>}
                </button>
            </div>
        </form>
    );
}

// 하단 컴포넌트들 (MakePage와 동일)
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

function PhoneInput({label, name, defaultValue = "", required = false, icon}: any) {
    const [value, setValue] = useState(defaultValue);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        let formattedValue = rawValue;
        if (rawValue.length > 3 && rawValue.length <= 7) {
            formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
        } else if (rawValue.length > 7) {
            formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
        }
        setValue(formattedValue);
    };
    return (
        <div className="space-y-2 group">
            <label className="block text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                {icon && <span className="text-slate-400 group-focus-within:text-slate-800 transition-colors">{icon}</span>}
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <input required={required} name={name} type="tel" value={value} onChange={handleChange} maxLength={13} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none bg-slate-50 text-sm font-medium text-slate-800" />
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