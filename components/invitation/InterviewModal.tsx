"use client";

import React from "react";
import { X } from "lucide-react";

type Props = {
    interviews: { q: string; a: string }[];
    onClose: () => void;
};

/** 신랑·신부 인터뷰(Q&A) 팝업 */
export default function InterviewModal({ interviews, onClose }: Props) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
            <div className="bg-[#FCFAF9] w-full max-w-[360px] rounded-[3rem] p-10 relative z-10 max-h-[75vh] overflow-y-auto animate-fade-in-up shadow-2xl">
                <button onClick={onClose} className="absolute top-10 right-10 text-gray-300 hover:text-gray-500 transition"><X/></button>
                <h4 className="font-serif text-2xl mb-14 text-center text-gray-800 font-bold italic underline underline-offset-8 decoration-rose-50">The Story</h4>
                <div className="space-y-12 text-center text-gray-600">
                    {interviews.map((iv, i) => (
                        <div key={i} className="space-y-5">
                            <p className="text-[11px] text-rose-300 font-bold tracking-[0.2em] uppercase font-sans">Q. {iv.q}</p>
                            <p className="font-serif text-base leading-[2.1] bg-white p-8 rounded-[2rem] shadow-sm italic border border-rose-50 whitespace-pre-line">&ldquo;{iv.a}&rdquo;</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
