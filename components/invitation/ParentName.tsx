import { normalizeParentMark } from "@/lib/parentMark";

/** 국화 아이콘 (고인 표시용) */
function Chrysanthemum({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
                <ellipse key={i} cx="10" cy="4.6" rx="1.7" ry="4" fill="currentColor" opacity="0.55"
                         transform={`rotate(${i * 30} 10 10)`}/>
            ))}
            <circle cx="10" cy="10" r="2.6" fill="currentColor"/>
        </svg>
    );
}

/** 부모님 이름 + 고인 표시 (故 또는 국화) */
export default function ParentName({ name, mark }: { name: string; mark?: string }) {
    const m = normalizeParentMark(mark);
    if (m === "故") return <>故 {name}</>;
    if (m === "flower") {
        return (
            <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
                <Chrysanthemum className="w-[1em] h-[1em] text-slate-400"/>
                <span className="sr-only">고인</span>{name}
            </span>
        );
    }
    return <>{name}</>;
}
