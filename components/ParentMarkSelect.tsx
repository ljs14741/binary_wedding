import { PARENT_MARK_OPTIONS } from "@/lib/parentMark";

/** 만들기·수정 폼: 부모님 성함 아래 고인 표시 선택 (선택사항, 기본 표시 안 함) */
export default function ParentMarkSelect({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
    return (
        <label className="flex items-center gap-2 -mt-3 ml-1 text-xs text-slate-400">
            고인 표시
            <select name={name} defaultValue={defaultValue ?? ""}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600 outline-none focus:border-slate-400">
                {PARENT_MARK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </label>
    );
}
