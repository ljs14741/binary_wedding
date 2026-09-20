"use client";

import React, { useRef } from "react";
import Script from "next/script";

declare global {
    interface Window {
        naver?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
        Kakao?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
}

type Props = {
    lat: number | null;
    lng: number | null;
    className?: string;
};

/** 네이버 지도 SDK 로드 + 마커 표시. 좌표가 없으면 빈 박스만 렌더 */
export default function NaverMap({ lat, lng, className = "" }: Props) {
    const mapRef = useRef<HTMLDivElement>(null);

    const initMap = () => {
        const la = Number(lat);
        const ln = Number(lng);
        if (!mapRef.current || !window.naver || isNaN(la) || isNaN(ln) || la === 0) {
            console.error("지도를 로드할 수 없는 좌표입니다.", lat, lng);
            return;
        }
        const map = new window.naver.maps.Map(mapRef.current, {
            center: new window.naver.maps.LatLng(la, ln),
            zoom: 16,
            zoomControl: false,
            scrollWheel: false,
        });
        new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(la, ln),
            map,
        });
    };

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
                onLoad={initMap}
            />
            <div ref={mapRef} id="map" className={className}/>
        </>
    );
}
