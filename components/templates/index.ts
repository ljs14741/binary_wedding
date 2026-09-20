import type { ComponentType } from "react";
import type { TemplateProps } from "@/components/invitation/types";
import { TEMPLATES, getTemplateMeta, type TemplateMeta } from "./meta";
import Type1 from "./Type1";
import MiniHompy from "./MiniHompy";

export * from "./meta";

/** template_type → 렌더 컴포넌트 */
const COMPONENTS: Record<string, ComponentType<TemplateProps>> = {
    type1: Type1,
    minihompy: MiniHompy,
};

export function getTemplateComponent(id: string | null | undefined): ComponentType<TemplateProps> {
    return COMPONENTS[getTemplateMeta(id).id] ?? Type1;
}

/** 등록 순서대로 (meta, component) 쌍을 돌려준다 — 샘플 페이지용 */
export function getTemplateByIndex(index: number): (TemplateMeta & { component: ComponentType<TemplateProps> }) | undefined {
    const meta = TEMPLATES[index];
    if (!meta) return undefined;
    return { ...meta, component: getTemplateComponent(meta.id) };
}
