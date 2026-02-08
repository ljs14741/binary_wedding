// components/EditFormGuard.tsx
"use client";

import { useState } from "react";
import EditForm from "./EditForm";
import bcrypt from "bcryptjs";
import { Lock, ChevronRight, ShieldCheck } from "lucide-react";

export default function EditFormGuard({ initialData }: { initialData: any }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async () => {
        if (!password) return;
        setIsVerifying(true);
        setError("");

        try {
            // DB의 해시된 암호와 입력한 암호 비교
            const isMatch = await bcrypt.compare(password, initialData.hashedPassword);

            if (isMatch) {
                setIsAuthenticated(true);
            } else {
                setError("비밀번호가 일치하지 않습니다.");
                setPassword("");
            }
        } catch (err) {
            setError("인증 중 오류가 발생했습니다.");
        } finally {
            setIsVerifying(false);
        }
    };

    // 인증 성공 시에만 실제 수정 폼을 보여줌
    if (isAuthenticated) {
        return <EditForm initialData={initialData} />;
    }

    // 인증 전에는 비밀번호 입력창만 노출 (개인정보 보호)
    return (
        <div className="max-w-md mx-auto p-8 md:p-12 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 text-center animate-fade-in">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 font-serif italic">접근 제한</h2>
            <p className="text-slate-500 text-[15px] mb-10 leading-relaxed">
                개인정보 보호를 위해<br/>
                설정하신 <b>비밀번호</b>를 입력해 주세요.
            </p>

            <div className="space-y-5">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    placeholder="숫자 4~6자리"
                    className="w-full px-6 py-5 rounded-2xl border border-slate-200 bg-slate-50 text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all font-bold placeholder:tracking-normal placeholder:text-sm placeholder:font-medium"
                />
                {error && <p className="text-rose-500 text-sm font-bold animate-pulse">{error}</p>}

                <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold flex justify-center items-center gap-3 hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isVerifying ? "인증 중..." : <>인증하고 수정하기 <ChevronRight size={20} /></>}
                </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-300">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Access Point</span>
            </div>
        </div>
    );
}