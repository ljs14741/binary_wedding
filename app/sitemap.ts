import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl();

    // 정적 페이지
    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
        { url: `${baseUrl}/make`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
        { url: `${baseUrl}/check`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
        { url: `${baseUrl}/sample/1`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
        { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    ];

    // 개인 청첩장은 검색엔진에 노출하지 않음 (링크를 아는 사람만 접근)
    return staticPages;
}
