"use client";

import React, { useEffect, useRef } from "react";
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

/**
 * 네이버 지도 SDK 로드 + 마커 표시. 좌표가 없으면 빈 박스만 렌더.
 * Script onLoad는 최초 1회만 불리므로, 탭 전환 등으로 다시 마운트될 때는 useEffect에서 직접 초기화한다.
 */
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

    // 스크립트가 이미 로드된 상태로 다시 마운트된 경우 (웨딩홈피 지도 탭 재방문 등)
    useEffect(() => {
        if (window.naver?.maps) initMap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lat, lng]);

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
