import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getBaseUrl();
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/edit/", "/admin"],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: ["/api/", "/edit/", "/admin"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
