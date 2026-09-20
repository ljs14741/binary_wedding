"use client";

import React from "react";
import { X, Phone, MessageSquare } from "lucide-react";
import type { Person } from "./types";

type Props = {
    groom: Person;
    bride: Person;
    isSample?: boolean;
    toast: (m: string) => Promise<void>;
    onClose: () => void;
};

/** 신랑·신부·혼주 연락처 팝업. 샘플 모드에서는 전화/문자 대신 안내 토스트 */
export default function ContactModal({ groom, bride, isSample, toast, onClose }: Props) {
    const sides = [
        { title: "신랑측 GROOM", label: "신랑", p: groom },
        { title: "신부측 BRIDE", label: "신부", p: bride },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
            <div className="bg-white w-full max-w-[380px] rounded-[3rem] p-10 relative z-10 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[85vh]">
                <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition"><X/></button>
                <h4 className="font-serif text-2xl mb-12 text-center text-gray-800 font-bold italic underline underline-offset-8 decoration-rose-50">연락하기</h4>
                <div className="space-y-12">
                    {sides.map(({ title, label, p }) => (
                        <div key={title} className="space-y-8">
                            <p className="text-[12px] text-rose-300 font-bold font-sans uppercase tracking-[0.3em] border-b border-rose-50 pb-3 text-left">{title}</p>
                            <ContactRow label={label} name={p.name} phone={p.contact} isSample={isSample} toast={toast}/>
                            {p.father && <ContactRow label="혼주(부)" name={p.father} phone={p.father_contact || ""} isSample={isSample} toast={toast}/>}
                            {p.mother && <ContactRow label="혼주(모)" name={p.mother} phone={p.mother_contact || ""} isSample={isSample} toast={toast}/>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ContactRow({ label, name, phone, isSample, toast }: {
    label: string; name: string; phone: string; isSample?: boolean; toast: (m: string) => Promise<void>;
}) {
    if (!phone) return null;
    const callCls = "w-10 h-10 bg-[#FDFBF9] border border-rose-50 rounded-full flex items-center justify-center text-rose-300 hover:bg-rose-50 transition";
    const smsCls = "w-10 h-10 bg-[#FDFBF9] border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition";

    return (
        <div className="flex justify-between items-center group">
            <span className="text-base font-bold text-gray-700">{label} {name}</span>
            <div className="flex gap-4">
                {isSample ? (
                    <>
                        <button type="button" onClick={() => toast("샘플 화면에서는 전화를 걸 수 없습니다.")} className={callCls}><Phone size={18}/></button>
                        <button type="button" onClick={() => toast("샘플 화면에서는 문자를 보낼 수 없습니다.")} className={smsCls}><MessageSquare size={18}/></button>
                    </>
                ) : (
                    <>
                        <a href={`tel:${phone}`} className={callCls}><Phone size={18}/></a>
                        <a href={`sms:${phone}`} className={smsCls}><MessageSquare size={18}/></a>
                    </>
                )}
            </div>
        </div>
    );
}
