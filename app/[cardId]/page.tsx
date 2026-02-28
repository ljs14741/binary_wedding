import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Type1 from "@/components/Type1";
import { getBaseUrl } from "@/lib/site";
import type { Metadata } from "next";

// [중요] Next.js 15+ 에서는 params가 Promise 타입입니다.
interface PageProps {
    params: Promise<{ cardId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { cardId } = await params;
    const rawData = await prisma.invitations.findUnique({
        where: { url_id: cardId },
        select: {
            groom_name: true,
            bride_name: true,
            wedding_date: true,
            location_name: true,
            og_photo_url: true,
            middle_photo_url: true,
            main_photo_url: true,
        },
    });

    if (!rawData) return { title: "청첩장" };

    const title = `${rawData.groom_name} & ${rawData.bride_name} 청첩장`;
    const dateStr = rawData.wedding_date
        ? new Date(rawData.wedding_date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "";
    const description = `${rawData.location_name}에서 ${dateStr} 예식을 진행합니다. 모바일 청첩장으로 축하 메시지를 남겨 주세요.`;
    const baseUrl = getBaseUrl();

    // OG 이미지: 카톡 공유용 > 1:1 대표사진 > 메인 슬라이드 첫 장
    let ogImageUrl: string | undefined;
    if (rawData.og_photo_url?.startsWith("/")) {
        ogImageUrl = `${baseUrl}${rawData.og_photo_url}`;
    } else if (rawData.middle_photo_url?.startsWith("/")) {
        ogImageUrl = `${baseUrl}${rawData.middle_photo_url}`;
    } else if (rawData.main_photo_url) {
        try {
            const mainUrls = JSON.parse(rawData.main_photo_url) as string[];
            const first = Array.isArray(mainUrls) ? mainUrls[0] : rawData.main_photo_url;
            if (typeof first === "string" && first.startsWith("/")) ogImageUrl = `${baseUrl}${first}`;
        } catch {
            // fallback 없음
        }
    }

    const openGraph: Metadata["openGraph"] = {
        title,
        description,
        url: `${baseUrl}/${cardId}`,
        type: "website",
    };
    if (ogImageUrl) {
        // 카톡 공유용(1200x630 권장) vs 1:1 대표사진 구분하여 크기 힌트
        const isCustomOg = !!rawData.og_photo_url?.startsWith("/");
        openGraph.images = [
            { url: ogImageUrl, width: 1200, height: isCustomOg ? 630 : 1200, alt: `${rawData.groom_name} & ${rawData.bride_name} 청첩장` },
        ];
    }

    return {
        title,
        description,
        robots: { index: false, follow: false },
        openGraph,
        twitter: ogImageUrl ? { card: "summary_large_image", images: [ogImageUrl] } : undefined,
        alternates: { canonical: `${baseUrl}/${cardId}` },
    };
}

export default async function CardPage({ params }: PageProps) {
    // [수정] params를 await 하여 cardId를 추출해야 합니다.
    const { cardId } = await params;

    // 1. DB 조회
    const rawData = await prisma.invitations.findUnique({
        where: { url_id: cardId },
        include: {
            invitation_accounts: true,
            invitation_photos: { orderBy: { sort_order: 'asc' } },
            invitation_interviews: true,
            invitation_guestbook: { orderBy: { created_at: 'desc' } },
        }
    });

    if (!rawData) return notFound();

    // 2. 메인 사진 JSON 파싱 (문자열 -> 배열)
    let mainImages: string[] = [];
    try {
        if (rawData.main_photo_url) {
            mainImages = JSON.parse(rawData.main_photo_url);
        }
    } catch (e) {
        // 예외 처리: 만약 배열 형식이 아니라면 단일 문자열로 처리
        if (rawData.main_photo_url) mainImages = [rawData.main_photo_url];
    }

    // 3. 데이터 변환 (DB -> 컴포넌트 Props)
    const formattedData = {
        groom: {
            name: rawData.groom_name,
            contact: rawData.groom_contact || "",
            father: rawData.groom_father || "",
            mother: rawData.groom_mother || "",
            father_contact: rawData.groom_father_contact || "",
            mother_contact: rawData.groom_mother_contact || "",
        },
        bride: {
            name: rawData.bride_name,
            contact: rawData.bride_contact || "",
            father: rawData.bride_father || "",
            mother: rawData.bride_mother || "",
            father_contact: rawData.bride_father_contact || "",
            mother_contact: rawData.bride_mother_contact || "",
        },
        date: rawData.wedding_date,
        location: rawData.location_name,
        detail: rawData.location_detail || "",
        address: rawData.location_address,
        location_lat: rawData.location_lat ? Number(rawData.location_lat) : null,
        location_lng: rawData.location_lng ? Number(rawData.location_lng) : null,
        message: rawData.welcome_msg || "",

        // [중요] 배열로 넘겨줍니다.
        mainImages,
        middleImage: rawData.middle_photo_url || "",
        gallery: rawData.invitation_photos.map(p => p.photo_url),

        transport: {
            subway: rawData.transport_subway || "",
            bus: rawData.transport_bus || "",
            parking: rawData.transport_parking || "",
        },

        accounts: rawData.invitation_accounts.map(acc => ({
            side: acc.side,
            bank: acc.bank_name,
            num: acc.account_number,
            name: acc.owner_name
        })),

        interviews: rawData.invitation_interviews.map(iv => ({
            q: iv.question,
            a: iv.answer
        })),

        guestbook: rawData.invitation_guestbook.map(g => ({
            id: g.id,
            author_name: g.author_name,
            message: g.message,
            created_at: g.created_at,
        })),
        url_id: cardId,
    };

    return <Type1 data={formattedData} />;
}