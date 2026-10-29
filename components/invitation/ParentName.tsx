import { normalizeParentMark } from "@/lib/parentMark";

/** 부모님 이름 + 고인 표시 (故) */
export default function ParentName({ name, mark }: { name: string; mark?: string }) {
    return normalizeParentMark(mark) === "故" ? <>故 {name}</> : <>{name}</>;
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
