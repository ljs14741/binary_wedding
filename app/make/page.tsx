"use client";

import { createInvitation } from "@/app/actions";
import { useToast } from "@/components/ui/ToastProvider";
import { useState, useEffect, useRef } from "react";
import { Upload, Calendar, MapPin, Heart, Car, MessageCircle, CreditCard, User, Users, ChevronRight, AlertCircle, Image as ImageIcon, X, ChevronLeft, Share2, Trash2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Script from "next/script";
import { processImage } from "@/lib/image";

const CLIENT_ID_KEY = "wedding_client_id";

function getOrCreateClientId(): string {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
}

export default function MakePage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [clientId, setClientId] = useState("");

    // --------------------------------------------------------
    // 1. 메인 사진 상태 관리 (순서 변경, 추가, 삭제)
    // --------------------------------------------------------
    const [showPostcode, setShowPostcode] = useState(false);
    const [mainFiles, setMainFiles] = useState<File[]>([]);
    const [mainPreviews, setMainPreviews] = useState<string[]>([]);
    const [mainUploadedUrls, setMainUploadedUrls] = useState<string[]>([]);
    const [isMainUploading, setIsMainUploading] = useState(false);

    const mainInputRef = useRef<HTMLInputElement>(null);
    const addMainInputRef = useRef<HTMLInputElement>(null); // 추가 버튼용
    const postcodeWrapRef = useRef<HTMLDivElement>(null);

    // 주소 검색 열기 (embed 모드: 모바일/카카오톡 WebView에서 window.open 대신 사용 → 카카오톡 채널로 튕기는 현상 방지)
    const openPostcode = () => {
        const Daum = (window as any).daum;
        if (!Daum?.Postcode) {
            toast("주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }
        setShowPostcode(true);
    };

    // showPostcode true 시 DOM 반영 후 embed 실행
    useEffect(() => {
        if (!showPostcode) return;
        const el = postcodeWrapRef.current;
        const Daum = (window as any).daum;
        if (!el || !Daum?.Postcode) return;
        new Daum.Postcode({
            oncomplete(data: any) {
                const fullAddr = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
                const input = document.getElementsByName("location_address")[0] as HTMLInputElement;
                if (input) input.value = fullAddr;
                setShowPostcode(false);
            },
            onresize(size: { height: number }) {
                el.style.height = size.height + "px";
            },
            width: "100%",
            height: "100%",
        }).embed(el);
    }, [showPostcode]);

    // 페이지 로드 시 고유 식별자(UUID) 생성·저장 (중복 생성 방지용)
    useEffect(() => {
        setClientId(getOrCreateClientId());
    }, []);

    const uploadImageFile = async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/uploads/image", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data?.success || !data?.url) {
            throw new Error(data?.message || "이미지 업로드에 실패했습니다.");
        }
        return data.url as string;
    };

    // ① [메인] 파일 선택 핸들러
    const handleMainChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        if (files.length > 3) toast("메인 슬라이드는 최대 3장입니다. 처음 3장만 적용됩니다.");
        const selectedFiles = Array.from(files).slice(0, 3);
        try {
            setIsMainUploading(true);
            const processedFiles = await Promise.all(selectedFiles.map(f => processImage(f)));
            const uploadedUrls = await Promise.all(processedFiles.map(f => uploadImageFile(f)));
            updateMainState(processedFiles, uploadedUrls);
        } catch (error) {
            console.error("이미지 처리 중 오류:", error);
            toast("이미지 처리 중 문제가 발생했습니다.");
        } finally {
            setIsMainUploading(false);
        }
    };

    // ② [메인] 추가 핸들러
    const handleMainAppend = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const toAdd = Math.min(files.length, 3 - mainFiles.length);
        if (toAdd <= 0) { toast("메인 슬라이드는 최대 3장입니다."); e.target.value = ""; return; }
        if (files.length > toAdd) toast(`메인 슬라이드는 최대 3장입니다. 필요한 ${toAdd}장만 적용됩니다.`);
        try {
            setIsMainUploading(true);
            const selected = Array.from(files).slice(0, toAdd);
            const processed = await Promise.all(selected.map(f => processImage(f)));
            const newUrls = await Promise.all(processed.map(f => uploadImageFile(f)));
            updateMainState([...mainFiles, ...processed], [...mainUploadedUrls, ...newUrls]);
        } catch (err) {
            console.error("이미지 처리 오류:", err);
            toast("이미지 처리 중 문제가 발생했습니다.");
        } finally {
            setIsMainUploading(false);
            e.target.value = "";
        }
    };

    // ③ [메인] 상태 업데이트 공통 함수
    const updateMainState = (files: File[], uploadedUrls: string[]) => {
        setMainFiles(files);
        setMainUploadedUrls(uploadedUrls);
        mainPreviews.forEach(url => URL.revokeObjectURL(url));
        setMainPreviews(files.map(file => URL.createObjectURL(file)));
    };

    // ④ [메인] 이동 및 삭제
    const moveMainFile = (index: number, direction: 'left' | 'right') => {
        const newFiles = [...mainFiles];
        const newUrls = [...mainUploadedUrls];
        if (direction === 'left' && index > 0) {
            [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
            [newUrls[index], newUrls[index - 1]] = [newUrls[index - 1], newUrls[index]];
        } else if (direction === 'right' && index < newFiles.length - 1) {
            [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
            [newUrls[index], newUrls[index + 1]] = [newUrls[index + 1], newUrls[index]];
        }
        updateMainState(newFiles, newUrls);
    };
    const removeMainFile = (index: number) => {
        updateMainState(mainFiles.filter((_, i) => i !== index), mainUploadedUrls.filter((_, i) => i !== index));
    };
    const clearAllMainFiles = () => {
        updateMainState([], []);
    };


    // --------------------------------------------------------
    // 2. 갤러리 사진 상태 관리 (순서 변경, 추가, 삭제)
    // --------------------------------------------------------
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryUploadedUrls, setGalleryUploadedUrls] = useState<string[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [isGalleryUploading, setIsGalleryUploading] = useState(false);

    const galleryInputRef = useRef<HTMLInputElement>(null); // 선택용
    const addGalleryInputRef = useRef<HTMLInputElement>(null); // 추가 버튼용

    const uploadGalleryImage = async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/uploads/image", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data?.success || !data?.url) {
            throw new Error(data?.message || "갤러리 업로드에 실패했습니다.");
        }
        return data.url as string;
    };

    // ① [갤러리] 파일 선택 핸들러 (최초/전체)
    const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (files.length > 20) {
            toast("갤러리는 최대 20장입니다. 처음 20장만 적용됩니다.");
        }
        const selectedFiles = Array.from(files).slice(0, 20);

        try {
            setIsGalleryUploading(true);
            const processedFiles = await Promise.all(selectedFiles.map(file => processImage(file)));
            const uploadedUrls = await Promise.all(processedFiles.map((file) => uploadGalleryImage(file)));
            updateGalleryState(processedFiles, uploadedUrls);
        } catch (error) {
            console.error("갤러리 이미지 처리 오류:", error);
            const msg = error instanceof Error ? error.message : "이미지 처리 중 문제가 발생했습니다.";
            toast(msg);
        } finally {
            setIsGalleryUploading(false);
        }
    };

    // ② [갤러리] 추가 핸들러
    const handleGalleryAppend = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const rawFilesArr = Array.from(files);

        const canAdd = 20 - galleryFiles.length;
        if (canAdd <= 0) {
            toast("갤러리는 최대 20장입니다.");
            e.target.value = "";
            return;
        }
        if (rawFilesArr.length > canAdd) {
            toast(`갤러리는 최대 20장입니다. ${canAdd}장만 추가됩니다.`);
        }
        const toProcess = rawFilesArr.slice(0, canAdd);

        try {
            setIsGalleryUploading(true);
            const processedFiles = await Promise.all(toProcess.map(file => processImage(file)));
            const uploadedUrls = await Promise.all(processedFiles.map((file) => uploadGalleryImage(file)));
            const updatedFiles = [...galleryFiles, ...processedFiles];
            const updatedUrls = [...galleryUploadedUrls, ...uploadedUrls];
            updateGalleryState(updatedFiles, updatedUrls);

            e.target.value = "";
        } catch (error) {
            console.error("갤러리 추가 처리 오류:", error);
            const msg = error instanceof Error ? error.message : "이미지 처리 중 문제가 발생했습니다.";
            toast(msg);
        } finally {
            setIsGalleryUploading(false);
        }
    };

    // ③ [갤러리] 상태 업데이트 공통 함수
    const updateGalleryState = (files: File[], uploadedUrls: string[]) => {
        setGalleryFiles(files);
        setGalleryUploadedUrls(uploadedUrls);
        galleryPreviews.forEach(url => URL.revokeObjectURL(url));
        setGalleryPreviews(files.map(file => URL.createObjectURL(file)));
    };

    // ④ [갤러리] 이동 및 삭제
    const moveGalleryFile = (index: number, direction: 'left' | 'right') => {
        const newFiles = [...galleryFiles];
        if (direction === 'left' && index > 0) {
            [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
        } else if (direction === 'right' && index < newFiles.length - 1) {
            [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
        }
        const newUrls = [...galleryUploadedUrls];
        if (direction === 'left' && index > 0) {
            [newUrls[index], newUrls[index - 1]] = [newUrls[index - 1], newUrls[index]];
        } else if (direction === 'right' && index < newUrls.length - 1) {
            [newUrls[index], newUrls[index + 1]] = [newUrls[index + 1], newUrls[index]];
        }
        updateGalleryState(newFiles, newUrls);
    };
    const removeGalleryFile = (index: number) => {
        updateGalleryState(
            galleryFiles.filter((_, i) => i !== index),
            galleryUploadedUrls.filter((_, i) => i !== index)
        );
    };
    const clearAllGalleryFiles = () => {
        updateGalleryState([], []);
    };


    // --------------------------------------------------------
    // 3. 중간(초대장) 이미지
    // --------------------------------------------------------
    const [middlePreview, setMiddlePreview] = useState<string | null>(null);
    const [middleUploadedUrl, setMiddleUploadedUrl] = useState<string | null>(null);
    const middleInputRef = useRef<HTMLInputElement>(null);
    const [ogPreview, setOgPreview] = useState<string | null>(null);
    const [ogUploadedUrl, setOgUploadedUrl] = useState<string | null>(null);
    const ogInputRef = useRef<HTMLInputElement>(null);

    const handleMiddleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        try {
            const processedFile = await processImage(files[0]);
            if (middlePreview) URL.revokeObjectURL(middlePreview);
            setMiddlePreview(URL.createObjectURL(processedFile));
            const url = await uploadImageFile(processedFile);
            setMiddleUploadedUrl(url);
        } catch (error) {
            console.error("이미지 처리 중 오류:", error);
            toast("이미지 처리 중 문제가 발생했습니다.");
        }
    };
    const clearMiddleFile = () => {
        if (middlePreview) URL.revokeObjectURL(middlePreview);
        setMiddlePreview(null);
        setMiddleUploadedUrl(null);
        if (middleInputRef.current) {
            middleInputRef.current.value = "";
            middleInputRef.current.files = new DataTransfer().files;
        }
    };

    const handleOgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        try {
            const processed = await processImage(files[0]);
            if (ogPreview) URL.revokeObjectURL(ogPreview);
            setOgPreview(URL.createObjectURL(processed));
            const url = await uploadImageFile(processed);
            setOgUploadedUrl(url);
        } catch (err) {
            console.error("이미지 처리 오류:", err);
            toast("이미지 처리 중 문제가 발생했습니다.");
        }
    };
    const clearOgFile = () => {
        if (ogPreview) URL.revokeObjectURL(ogPreview);
        setOgPreview(null);
        setOgUploadedUrl(null);
        if (ogInputRef.current) {
            ogInputRef.current.value = "";
            ogInputRef.current.files = new DataTransfer().files;
        }
    };

    // --------------------------------------------------------
    // 4. 폼 제출 (즉시 disabled + 로딩, UUID 포함, 중복 요청 방지)
    // --------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);
        const address = formData.get("location_address") as string;

        if (!address || address.trim() === "") {
            toast("주소를 입력해주세요. 주소 검색 버튼을 클릭하여 선택해야 합니다.");
            document.getElementsByName("location_address")[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        if (isMainUploading) {
            toast("메인 사진 업로드가 진행 중입니다. 잠시만 기다려주세요.");
            return;
        }
        if (mainUploadedUrls.length < 3) {
            toast(`메인 슬라이드 사진은 3장이 필수입니다.\n(현재 ${mainUploadedUrls.length}장)`);
            return;
        }
        if (!middleUploadedUrl) {
            toast("초대장 대표 사진을 업로드해주세요.");
            return;
        }
        if (isGalleryUploading) {
            toast("갤러리 업로드가 진행 중입니다. 잠시만 기다려주세요.");
            return;
        }
        if (galleryUploadedUrls.length < 1) {
            toast("웨딩 갤러리 사진은 최소 1장이 필수입니다.");
            return;
        }

        setLoading(true);
        const id = clientId || getOrCreateClientId();
        if (!id) setClientId(getOrCreateClientId());
        formData.set("_clientId", id);

        try {
            await createInvitation(formData);
        } catch (err) {
            // redirect() 성공 시 Next.js가 던지는 신호 — 토스트 노출 금지, 그대로 rethrow
            const digest = err && typeof err === "object" ? (err as { digest?: string }).digest : undefined;
            const msg = err instanceof Error ? err.message : String(err);
            if (digest === "NEXT_REDIRECT" || msg === "NEXT_REDIRECT") throw err;

            setLoading(false);
            const safeMsg = (msg && msg.trim().length > 3 && !/^(fail|error|failed|NEXT_REDIRECT)$/i.test(msg.trim()))
                ? msg
                : "청첩장 생성에 실패했습니다. 네트워크 상태를 확인하고 잠시 후 다시 시도해 주세요.";
            toast(safeMsg);
        }
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
        <div className="min-h-screen bg-[#FDFCFB] font-sans selection:bg-rose-100 flex flex-col">
            <SiteHeader />

            {/* 주소 검색 레이어 (embed 모드) - 모바일/카카오톡에서 window.open → 카카오톡 채널로 튕기는 현상 방지 */}
            {showPostcode && (
                <div className="fixed inset-0 z-[200] bg-slate-900/40 flex flex-col justify-end">
                    <div ref={postcodeWrapRef} className="bg-white rounded-t-3xl shadow-2xl overflow-hidden min-h-[400px]" style={{ height: "70vh" }} />
                    <button type="button" onClick={() => setShowPostcode(false)} className="py-4 bg-white border-t border-slate-200 text-slate-600 font-bold text-sm">닫기</button>
                </div>
            )}

            <div className="flex-1 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">청첩장 만들기</h1>
                        <p className="text-slate-500 text-sm md:text-base font-medium">아래 항목을 입력해 주세요.</p>
                    </div>

                    <form className="space-y-10" onSubmit={handleSubmit}>

                        {/* 신랑 정보 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                                <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm">🤵‍♂️</span><span className="flex-1">신랑 측 정보</span>
                            </h3>
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="신랑 성함" name="groom_name" placeholder="예: 홍길동" required icon={<User size={16}/>}/>
                                    <PhoneInput label="신랑 연락처" name="groom_contact" required icon={<MessageCircle size={16}/>}/>
                                </div>
                                <AccountGroup label="신랑 계좌" bankName="account_groom_bank" accountNum="account_groom_num" />
                                <div className="h-px bg-slate-100 my-4"/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="아버지 성함" name="groom_father" placeholder="예: 홍길동" icon={<Users size={16}/>}/>
                                    <PhoneInput label="아버지 연락처" name="groom_father_contact" icon={<MessageCircle size={16}/>}/>
                                </div>
                                <AccountGroup label="아버지 계좌" bankName="account_groom_f_bank" accountNum="account_groom_f_num" />
                                <div className="h-px bg-slate-100 my-4"/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="어머니 성함" name="groom_mother" placeholder="예: 김영희" icon={<Users size={16}/>}/>
                                    <PhoneInput label="어머니 연락처" name="groom_mother_contact" icon={<MessageCircle size={16}/>}/>
                                </div>
                                <AccountGroup label="어머니 계좌" bankName="account_groom_m_bank" accountNum="account_groom_m_num" />
                            </div>
                        </section>

                        {/* 신부 정보 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                                <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm">👰‍♀️</span><span className="flex-1">신부 측 정보</span>
                            </h3>
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="신부 성함" name="bride_name" placeholder="예: 김영희" required icon={<User size={16}/>}/>
                                    <PhoneInput label="신부 연락처" name="bride_contact" required icon={<MessageCircle size={16}/>}/>
                                </div>
                                <AccountGroup label="신부 계좌" bankName="account_bride_bank" accountNum="account_bride_num" />
                                <div className="h-px bg-slate-100 my-4"/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="아버지 성함" name="bride_father" placeholder="예: 김철수" icon={<Users size={16}/>}/>
                                    <PhoneInput label="아버지 연락처" name="bride_father_contact" icon={<MessageCircle size={16}/>}/>
                                </div>
                                <AccountGroup label="아버지 계좌" bankName="account_bride_f_bank" accountNum="account_bride_f_num" />
                                <div className="h-px bg-slate-100 my-4"/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="어머니 성함" name="bride_mother" placeholder="예: 이영희" icon={<Users size={16}/>}/>
                                    <PhoneInput label="어머니 연락처" name="bride_mother_contact" icon={<MessageCircle size={16}/>}/>
                                </div>
                                <AccountGroup label="어머니 계좌" bankName="account_bride_m_bank" accountNum="account_bride_m_num" />
                            </div>
                        </section>

                        {/* 예식 및 교통 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                                <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">📅</span><span className="flex-1">예식 및 초대글</span>
                            </h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="예식 일시" name="wedding_date" type="datetime-local" required />
                                    <InputGroup label="예식장 이름" name="location_name" placeholder="예: 더채플앳청담" required icon={<Heart size={16}/>}/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="상세 홀 이름" name="location_detail" placeholder="예: 3층 컨벤션홀"
                                                icon={<MapPin size={16}/>}/>
                                    <div className="space-y-2 group">
                                        <label
                                            className="block text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                            <MapPin size={16} className="text-slate-400"/> 주소 (지도 표시용) <span
                                            className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            required
                                            name="location_address"
                                            readOnly
                                            placeholder="클릭하여 주소를 검색하세요"
                                            onClick={openPostcode}
                                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 cursor-pointer bg-slate-50 hover:bg-white focus:ring-1 focus:ring-slate-800 transition-all outline-none text-sm font-medium text-slate-800"
                                        />
                                        {/* 스크립트 로드 - 폼 내부나 하단에 배치 */}
                                        <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
                                                strategy="afterInteractive"/>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 ml-1">초대 문구</label>
                                    <textarea name="welcome_msg" rows={6}
                                              placeholder={"서로가 마주 보며 다진 약속을\n이제 여러분 앞에서 소중히 맺으려 합니다.\n저희의 새로운 시작을 위해\n따뜻한 축복을 보내주시면 감사하겠습니다."}
                                              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none bg-slate-50 text-sm leading-relaxed text-slate-800 resize-none placeholder:text-slate-400"/>
                                </div>
                                <div className="pt-6 border-t border-slate-100 space-y-6">
                                    <h4 className="font-bold text-base text-slate-800 flex items-center gap-2"><Car
                                        size={18} className="text-slate-400"/> 오시는 길 안내</h4>
                                    <TextAreaGroup label="지하철 안내" name="transport_subway" placeholder="예: 7호선 ○○역 1번 출구 도보 5분"/>
                                    <TextAreaGroup label="버스 안내" name="transport_bus" placeholder="예: ○○정류장 하차"/>
                                    <TextAreaGroup label="주차 안내" name="transport_parking" placeholder="예: 웨딩홀 내 주차 가능 (하객 무료)"/>
                                </div>
                            </div>
                        </section>

                        {/* 인터뷰 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                                <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shadow-sm">🎤</span><span className="flex-1">신랑신부 인터뷰</span>
                            </h3>
                            <p className="text-xs text-slate-500 mb-6">질문과 답변 모두 수정할 수 있습니다.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-6 rounded-[1.5rem] space-y-3 border border-slate-100">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">질문 01</label>
                                    <input name="interview_q1" defaultValue="서로의 첫 만남은?" placeholder="질문을 입력하세요" className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-200 transition-colors placeholder:text-slate-400"/>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">답변</label>
                                    <textarea name="interview_a1" rows={3} placeholder="벚꽃이 흩날리던 어느 봄날이었습니다. 수줍게 웃던 모습에 이끌려 오늘까지 오게 되었네요." className="w-full bg-white p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-200 placeholder:text-slate-400"/>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-[1.5rem] space-y-3 border border-slate-100">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">질문 02</label>
                                    <input name="interview_q2" defaultValue="서로에게 바라는 점?" placeholder="질문을 입력하세요" className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-200 transition-colors placeholder:text-slate-400"/>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">답변</label>
                                    <textarea name="interview_a2" rows={3} placeholder="지금처럼 서로를 아끼고 웃음 가득한 예쁜 가정을 함께 만들어가고 싶어요." className="w-full bg-white p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-200 placeholder:text-slate-400"/>
                                </div>
                            </div>
                        </section>

                        {/* 5. 사진 등록 (수정됨: opacity-0 적용) */}
                        <section id="photo-section" className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                                <span className="w-10 h-10 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shadow-sm">📷</span>
                                <span className="flex-1">사진 등록</span>
                            </h3>

                            <div className="space-y-10">
                                {/* 메인 사진 */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <label className="text-base font-bold text-slate-700">
                                            메인 슬라이드 사진 <span className="text-rose-500 text-sm">(3장 필수)</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-blue-500 bg-blue-50 px-2 py-1 rounded-full font-bold">화살표로 순서 변경</span>
                                            {mainPreviews.length > 0 && (
                                                <button type="button" onClick={clearAllMainFiles} className="text-[11px] text-rose-500 bg-rose-50 px-2 py-1 rounded-full font-bold hover:bg-rose-100 flex items-center gap-1">
                                                    <Trash2 size={12}/> 전부 삭제
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">권장: 9:16 비율 / 1장당 15MB 이하</p>

                                    <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl min-h-[280px] flex flex-col items-center justify-center p-4 hover:bg-slate-50 hover:border-slate-300 transition-all overflow-hidden">
                                        {mainPreviews.length > 0 ? (
                                            <div className="absolute inset-0 z-10 bg-white flex items-center justify-center p-4 overflow-auto">
                                                <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                                                    {mainPreviews.map((src, idx) => (
                                                        <div key={idx} className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-slate-100 shadow-lg group/item min-w-0">
                                                            <img src={src} alt={`Main ${idx}`} className="w-full h-full object-cover"/>
                                                            <div className="absolute top-3 left-3 bg-black/70 text-white w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full shadow-md z-20">{idx + 1}</div>
                                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 flex justify-between items-center opacity-0 group-hover/item:opacity-100 transition-opacity z-20">
                                                                <button type="button" onClick={() => moveMainFile(idx, 'left')} disabled={idx === 0} className="p-1.5 text-white hover:bg-white/20 rounded-full disabled:opacity-30"><ChevronLeft size={16}/></button>
                                                                <button type="button" onClick={() => removeMainFile(idx)} className="p-1.5 text-rose-400 hover:bg-white/20 rounded-full"><X size={16}/></button>
                                                                <button type="button" onClick={() => moveMainFile(idx, 'right')} disabled={idx === mainPreviews.length - 1} className="p-1.5 text-white hover:bg-white/20 rounded-full disabled:opacity-30"><ChevronRight size={16}/></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {mainPreviews.length < 3 && (
                                                        <div
                                                            className="aspect-[9/16] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-2 cursor-pointer hover:bg-slate-50 transition-colors min-w-0"
                                                            onClick={() => addMainInputRef.current?.click()}
                                                        >
                                                            <Upload size={24}/>
                                                            <span className="text-xs font-bold">추가하기</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 py-6 pointer-events-none">
                                                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-2"><Upload size={20}/></div>
                                                <div className="text-xs text-slate-400 space-y-1 text-center">
                                                    <p>청첩장 최상단에 슬라이드로 보여질 사진입니다.</p>
                                                    <p className="font-bold text-slate-500">권장: 9:16 비율 / <span className="text-rose-500">1장당 15MB 이하</span></p>
                                                </div>
                                            </div>
                                        )}
                                        {/* [수정됨] opacity-0 추가로 못생긴 input 숨김 */}
                                        <input
                                            ref={mainInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleMainChange}
                                            className={`absolute inset-0 w-full h-full cursor-pointer opacity-0 ${mainPreviews.length > 0 ? 'hidden' : 'block z-20'}`}
                                        />
                                    </div>
                                    <input ref={addMainInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleMainAppend} />
                                    {mainUploadedUrls.map((url, idx) => (
                                        <input key={`main-${idx}`} type="hidden" name="mainImageUrls" value={url} />
                                    ))}
                                    {isMainUploading && <p className="text-[11px] text-blue-500 text-center">메인 사진 업로드 중입니다...</p>}
                                </div>

                                {/* 중간(초대장) 사진 */}
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
                                    <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl min-h-[280px] flex flex-col items-center justify-center p-4 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer overflow-hidden">
                                        {middlePreview ? (
                                            <div className="absolute inset-0 z-10 bg-white flex items-center justify-center p-4">
                                                <div className="relative w-full max-w-[200px] h-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm aspect-square">
                                                    <img src={middlePreview} alt="Middle" className="w-full h-full object-cover"/>
                                                </div>
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <p className="bg-white px-4 py-2 rounded-full text-sm font-bold shadow-lg text-slate-800"><ImageIcon size={16} className="inline mr-1"/> 클릭하면 변경</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 py-6">
                                                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><ImageIcon size={20}/></div>
                                                <div className="text-xs text-slate-400 space-y-1 text-center">
                                                    <p>'초대합니다' 문구 아래에 들어갈 사진입니다.</p>
                                                    <p className="font-bold text-slate-500">권장 사이즈: 1:1 비율 (정방형)</p>
                                                    <p className="text-rose-400 font-bold">15MB 이하만 업로드 가능</p>
                                                </div>
                                            </div>
                                        )}
                                        <input ref={middleInputRef} type="file" accept="image/*" onChange={handleMiddleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"/>
                                    {middleUploadedUrl && <input type="hidden" name="middleImageUrl" value={middleUploadedUrl} />}
                                    </div>
                                </div>

                                {/* 카톡 공유용 이미지 (선택) */}
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
                                        카카오톡 공유하기 버튼으로 보낼 때 사용되는 이미지입니다. 따로 올리지 않으면 위의 1:1 대표사진이 사용됩니다. <span className="text-rose-500 font-bold">권장 사이즈: 1:1 비율 (정방형), 1장당 15MB 이하</span>
                                    </p>
                                    <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl min-h-[280px] flex flex-col items-center justify-center p-4 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer overflow-hidden">
                                        {ogPreview ? (
                                            <div className="absolute inset-0 z-10 bg-white flex items-center justify-center p-4">
                                                <div className="relative w-full max-w-[200px] h-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm aspect-square">
                                                    <img src={ogPreview} alt="카톡 공유용" className="w-full h-full object-cover"/>
                                                </div>
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <p className="bg-white px-4 py-2 rounded-full text-sm font-bold shadow-lg text-slate-800"><ImageIcon size={16} className="inline mr-1"/> 클릭하면 변경</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 py-6">
                                                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><ImageIcon size={20}/></div>
                                                <div className="text-xs text-slate-400 space-y-1 text-center">
                                                    <p className="font-bold text-slate-500">권장 사이즈: 1:1 비율 (정방형)</p>
                                                    <p className="text-rose-400 font-bold">15MB 이하만 업로드 가능</p>
                                                </div>
                                            </div>
                                        )}
                                        <input ref={ogInputRef} type="file" accept="image/*" onChange={handleOgChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"/>
                                    {ogUploadedUrl && <input type="hidden" name="ogImageUrl" value={ogUploadedUrl} />}
                                    </div>
                                </div>

                                {/* 갤러리 사진 */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <label className="text-base font-bold text-slate-700">웨딩 갤러리 사진 <span className="text-rose-500 text-sm">(1~20장)</span></label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-blue-500 bg-blue-50 px-2 py-1 rounded-full font-bold">화살표로 순서 변경</span>
                                            {galleryPreviews.length > 0 && (
                                                <button type="button" onClick={clearAllGalleryFiles} className="text-[11px] text-rose-500 bg-rose-50 px-2 py-1 rounded-full font-bold hover:bg-rose-100 flex items-center gap-1">
                                                    <Trash2 size={12}/> 전부 삭제
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">권장: 1:1 비율 (정방형) / 1장당 15MB 이하</p>

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
                                                        <div
                                                            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-1 cursor-pointer hover:bg-slate-50 transition-colors"
                                                            onClick={() => addGalleryInputRef.current?.click()}
                                                        >
                                                            <Upload size={20}/>
                                                            <span className="text-[10px] font-bold">추가</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 py-6 pointer-events-none">
                                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2"><Upload size={20}/></div>
                                                <div className="text-xs text-slate-400 space-y-1 text-center">
                                                    <p>하객들이 보게 될 갤러리 탭에 들어갈 사진입니다.</p>
                                                    <p className="font-bold text-slate-500">권장: 1:1 비율 (정방형) / <span className="text-rose-500">1장당 15MB 이하</span></p>
                                                </div>
                                            </div>
                                        )}
                                        {/* [수정됨] 서버 액션 용량 이슈 회피: 갤러리는 사전 업로드 후 URL만 전송 */}
                                        <input ref={galleryInputRef} type="file" multiple accept="image/*" onChange={handleGalleryChange} className={`absolute inset-0 w-full h-full cursor-pointer opacity-0 ${galleryPreviews.length > 0 ? 'hidden' : 'block z-20'}`} />
                                    </div>
                                    <input ref={addGalleryInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryAppend} />
                                    {galleryUploadedUrls.map((url, idx) => (
                                        <input key={`${url}-${idx}`} type="hidden" name="galleryImageUrls" value={url} />
                                    ))}
                                    {isGalleryUploading && (
                                        <p className="text-[11px] text-blue-500 text-center">갤러리 사진 업로드 중입니다...</p>
                                    )}
                                    <p className="text-[11px] text-slate-400 text-center">* 사진은 최대 20장까지 등록 가능하며, 화살표로 순서를 변경할 수 있습니다.</p>
                                </div>
                            </div>
                        </section>

                        {/* 비밀번호 설정 + 만들기 완료 (한 카드로 통일) */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
                                <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">🔒</span>
                                <span className="flex-1">비밀번호 설정 <span className="text-xs font-normal text-slate-400 ml-2">(필수)</span></span>
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">청첩장 내용을 <b className="text-slate-700">수정하거나 삭제할 때</b> 필요한 비밀번호입니다. 숫자 4~6자리로 입력해 주세요.</p>
                            <div className="mb-8">
                                <input
                                    name="password"
                                    type="password"
                                    maxLength={6}
                                    minLength={4}
                                    placeholder="예: 1234"
                                    required
                                    className="w-full max-w-[200px] mx-auto block px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-center text-lg tracking-[0.4em] font-semibold placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || isGalleryUploading}
                                className="w-full py-5 bg-rose-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-900/20 hover:bg-rose-800 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-rose-700 flex justify-center items-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        생성 중입니다...
                                    </>
                                ) : (
                                    <>
                                        청첩장 만들기 완료
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </button>
                        </section>
                    </form>
                </div>
            </div>
            <SiteFooter />
        </div>
    );
}

// ----------------------------------------------------------------------
// 재사용 컴포넌트
// ----------------------------------------------------------------------

interface InputGroupProps {
    label: string;
    name: string;
    placeholder?: string;
    required?: boolean;
    type?: string;
    icon?: React.ReactNode;
}

function InputGroup({label, name, placeholder, required = false, type = "text", icon}: InputGroupProps) {
    return (
        <div className="space-y-2 group">
            <label className="block text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                {icon &&
                    <span className="text-slate-400 group-focus-within:text-slate-800 transition-colors">{icon}</span>}
                {label} {required && <span className="text-rose-500 text-xs font-extrabold" title="필수 입력">*</span>}
            </label>
            <input
                required={required}
                name={name}
                type={type}
                placeholder={placeholder}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 invalid:border-rose-200 invalid:bg-rose-50 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
            />
        </div>
    );
}

function PhoneInput({label, name, required = false, icon}: InputGroupProps) {
    const [value, setValue] = useState("");
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
                {label} {required && <span className="text-rose-500 text-xs font-extrabold" title="필수 입력">*</span>}
            </label>
            <input required={required} name={name} type="tel" value={value} onChange={handleChange} maxLength={13} placeholder="010-0000-0000" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-300 invalid:border-rose-200 invalid:bg-rose-50 focus:invalid:border-rose-500 focus:invalid:ring-rose-500" />
        </div>
    );
}

function TextAreaGroup({label, name, placeholder}: { label: string, name: string, placeholder?: string }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">{label}</label>
            <textarea name={name} rows={2} placeholder={placeholder} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none bg-slate-50 text-sm resize-none text-slate-800 placeholder:text-slate-400" />
        </div>
    );
}

function AccountGroup({ label, bankName, accountNum }: { label: string, bankName: string, accountNum: string }) {
    return (
        <div className="bg-slate-50 p-5 rounded-[1.5rem] space-y-3 border border-slate-100">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2"><CreditCard size={14}/> {label}</label>
            <div className="grid grid-cols-3 gap-3">
                <input name={bankName} placeholder="은행명" className="col-span-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none bg-white text-sm text-center font-medium text-slate-800 placeholder:text-slate-400" />
                <input name={accountNum} placeholder="계좌번호 (-포함)" className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400" />
            </div>
        </div>
    );
}