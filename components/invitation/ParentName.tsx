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

/**
 * "아버지 · 어머니의 장남" 한 줄. 부모님 칸을 비우면 있는 분만, 둘 다 없으면 null (한부모·부모 없음 대응)
 */
export function ParentsLine({ p }: { p: { father: string; mother: string; father_mark?: string; mother_mark?: string; order?: string } }) {
    const parents = [
        p.father && <ParentName key="f" name={p.father} mark={p.father_mark}/>,
        p.mother && <ParentName key="m" name={p.mother} mark={p.mother_mark}/>,
    ].filter(Boolean);
    if (parents.length === 0) return null;
    return (
        <>
            {parents.length === 2 ? <>{parents[0]} · {parents[1]}</> : parents[0]}
            {p.order ? `의 ${p.order}` : ""}
        </>
    );
}
