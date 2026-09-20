import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createElement } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TEMPLATES, getTemplateByIndex } from "@/components/templates";
import { getSampleData } from "@/lib/sampleData";

interface PageProps {
    params: Promise<{ id: string }>;
}

/** /sample/1 → TEMPLATES[0], /sample/2 → TEMPLATES[1] ... */
function templateFromParam(id: string) {
    const idx = Number(id) - 1;
    return Number.isInteger(idx) && idx >= 0 ? getTemplateByIndex(idx) : undefined;
}

export function generateStaticParams() {
    return TEMPLATES.map((_, i) => ({ id: String(i + 1) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const tpl = templateFromParam(id);
    if (!tpl) return { title: "샘플" };
    return {
        title: `${tpl.name} 샘플 | 모바일 청첩장 템플릿`,
        description: `Binary Wedding ${tpl.name} 모바일 청첩장 샘플. ${tpl.description}`,
        openGraph: {
            title: `${tpl.name} 모바일 청첩장 샘플 - Binary Wedding`,
            description: tpl.description,
        },
    };
}

/** 실제 청첩장 템플릿에 샘플 데이터를 꽂아 보여준다 */
export default async function SamplePage({ params }: PageProps) {
    const { id } = await params;
    const tpl = templateFromParam(id);
    if (!tpl) return notFound();

    return (
        <div className="min-h-screen bg-[#FAF8F6] flex flex-col">
            <SiteHeader/>
            <div className="flex-1 pt-28 pb-20">
                {createElement(tpl.component, { data: getSampleData(), isSample: true })}
            </div>
            <SiteFooter/>
        </div>
    );
}
