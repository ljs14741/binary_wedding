import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl();

    // 정적 페이지
    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
        { url: `${baseUrl}/make`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
        { url: `${baseUrl}/check`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
        { url: `${baseUrl}/sample/1`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    ];

    // 동적 청첩장 페이지 (DB에서 url_id 조회)
    let cardPages: MetadataRoute.Sitemap = [];
    try {
        const cards = await prisma.invitations.findMany({
            select: { url_id: true, updated_at: true },
            where: { is_active: true },
        });
        cardPages = cards.map((card) => ({
            url: `${baseUrl}/${card.url_id}`,
            lastModified: card.updated_at || new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        }));
    } catch {
        // DB 연결 실패 시 정적 페이지만 반환
    }

    return [...staticPages, ...cardPages];
}
