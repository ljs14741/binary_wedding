"use client";

import Script from "next/script";
import { buildShareDescription, buildShareTitle } from "@/lib/shareMessage";
import type { InvitationData } from "./types";

const KAKAO_JS_KEY = "ea07c2afa5b5a0a07737bab48ab8e3e8";

/** 카카오 SDK 로더. 템플릿 루트에 한 번만 넣는다 */
export function KakaoSdk() {
    return (
        <Script
            src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
            onLoad={() => {
                if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
            }}
        />
    );
}

/** 카카오톡 피드 공유. OG 사진 > 1:1 대표사진 > 메인 첫 장 순으로 썸네일 사용 */
export function shareKakao(data: InvitationData) {
    if (!window.Kakao) return;
    if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);

    const baseUrl = window.location.origin;
    const imagePath = data.ogImage || data.middleImage || data.mainImages[0] || "";
    const imageUrl = imagePath ? (imagePath.startsWith("http") ? imagePath : `${baseUrl}${imagePath}`) : "";
    const link = { mobileWebUrl: window.location.href, webUrl: window.location.href };

    window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
            title: buildShareTitle(data.groom.name, data.bride.name),
            description: buildShareDescription(new Date(data.date), data.location),
            imageUrl,
            link,
        },
        buttons: [{ title: "청첩장 보기", link }],
    });
}
