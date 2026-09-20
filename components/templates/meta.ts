/**
 * 템플릿 메타데이터. DB의 invitations.template_type 값이 id가 된다.
 * 컴포넌트 import가 없어 서버 액션·폼에서도 가볍게 쓸 수 있다.
 * 새 템플릿은 여기에 등록하고 index.ts의 컴포넌트 맵에도 연결한다.
 */
export interface TemplateMeta {
    id: string;
    name: string;
    description: string;
    /** 만들기 화면 카드에 보여줄 미리보기 이미지 */
    thumbnail: string;
    /** 샘플 페이지 경로 */
    samplePath: string;
}

export const TEMPLATES: TemplateMeta[] = [
    {
        id: "type1",
        name: "클래식 화이트",
        description: "은은한 세리프와 따뜻한 화이트 톤의 정갈한 청첩장",
        thumbnail: "/images/main1.png",
        samplePath: "/sample/1",
    },
];

export const DEFAULT_TEMPLATE_ID = TEMPLATES[0].id;

export function getTemplateMeta(id: string | null | undefined): TemplateMeta {
    return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function isValidTemplateId(id: unknown): id is string {
    return typeof id === "string" && TEMPLATES.some((t) => t.id === id);
}
