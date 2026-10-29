// 부모님 고인 표시 (선택). 기본은 표시 안 함

export type ParentMark = "" | "故";

export const PARENT_MARK_OPTIONS: { value: ParentMark; label: string }[] = [
    { value: "", label: "표시 안 함" },
    { value: "故", label: "故 (한자)" },
];

/** 폼/DB 값 → 허용된 값만 (그 외는 표시 안 함) */
export function normalizeParentMark(v: unknown): ParentMark {
    return v === "故" ? v : "";
}
