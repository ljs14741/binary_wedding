"use client";

import React from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface ReminderSectionProps {
  groomName: string;
  brideName: string;
  date: Date;
  location: string;
  address: string;
  detail: string;
  /** 샘플 화면이면 true - 실제 SMS/캘린더 동작 대신 안내 토스트 */
  isSample?: boolean;
}

function formatDateForSms(d: Date): string {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[d.getDay()];
  const hour = d.getHours();
  return `${month}월 ${day}일(${weekday}) ${hour}시`;
}

function formatDateForIcs(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

/** ICS 라인 폴딩 (RFC 5545: 75 octet 권장) — 한글 등 UTF-8 고려해 여유 있게 70자 단위 */
function foldIcsLine(line: string, maxLen = 70): string {
  if (line.length <= maxLen) return line;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += i === 0 ? maxLen : maxLen - 1) {
    parts.push(i === 0 ? line.slice(0, maxLen) : " " + line.slice(i, i + maxLen - 1));
  }
  return parts.join("\r\n");
}

function escapeIcsValue(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function getNaverMapUrl(address: string): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(address)}`;
}

export default function ReminderSection({
  groomName,
  brideName,
  date,
  location,
  address,
  detail,
  isSample = false,
}: ReminderSectionProps) {
  const { toast } = useToast();
  const mapUrl = getNaverMapUrl(address);
  const dateFormatted = formatDateForSms(date);
  const icsDateStart = formatDateForIcs(date);
  const icsDateEnd = formatDateForIcs(new Date(date.getTime() + 90 * 60 * 1000)); // +90분

  const handlePushAlarm = () => {
    if (isSample) {
      toast("샘플 화면에서는 실제 알림 기능을 사용할 수 없습니다.");
      return;
    }
  
    const invitationUrl = typeof window !== "undefined" ? window.location.href : "";
    const summary = `[내일 결혼식] ${groomName} & ${brideName}`;
    const loc = `${location} (${address})`;
    const desc = `예식 시간: ${date.toLocaleString("ko-KR", {
      dateStyle: "long",
      timeStyle: "short",
    })} / 상세위치: ${detail} / 청첩장: ${invitationUrl}`;
  
    // 1. 필수 표준 데이터 생성 (iOS 인식률 향상 핵심)
    const now = new Date();
    const dtStamp = formatDateForIcs(now); // 생성 시간
    const uid = Math.random().toString(36).substring(2, 11) + "@wedding-invitation"; // 고유 ID
  
    const rawIcs = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding//KO",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,          // 일정 고유 식별자 추가
      `DTSTAMP:${dtStamp}`,  // 일정 생성 시간 추가
      foldIcsLine(`SUMMARY:${escapeIcsValue(summary)}`),
      foldIcsLine(`LOCATION:${escapeIcsValue(loc)}`),
      foldIcsLine(`DESCRIPTION:${escapeIcsValue(desc)}`),
      `DTSTART:${icsDateStart}`,
      `DTEND:${icsDateEnd}`,
      "STATUS:CONFIRMED",    // 확정된 일정임을 명시
      "TRANSP:OPAQUE",       // 바쁨 상태 표시
      "BEGIN:VALARM",
      "TRIGGER:-PT1440M",    // 24시간 전 알림
      "ACTION:DISPLAY",
      foldIcsLine(`DESCRIPTION:${escapeIcsValue(summary)}`),
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
  
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    const isChrome = /CriOS/.test(userAgent); // iOS용 크롬 감지
  
    // 2. 파일 생성 (Blob 방식이 브라우저 호환성이 더 좋습니다)
    const blob = new Blob([rawIcs], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
  
    if (isIOS) {
      // iOS (Safari/Chrome 공통 대응)
      const a = document.createElement("a");
      a.href = url;
      a.download = "wedding-reminder.ics";
      a.click();
  
      if (isChrome) {
        // 크롬 사용자를 위한 별도 안내
        toast(
          "파일을 연 후, 하단 '공유' 버튼을 눌러 '캘린더'를 선택하거나 '추가'를 눌러주세요!"
        );
      } else {
        // 사파리 사용자를 위한 안내
        toast("'캘린더에 추가' 또는 '모두 추가'를 눌러 일정을 저장해 주세요.");
      }
    } else {
      // 안드로이드 및 PC
      const a = document.createElement("a");
      a.href = url;
      a.download = "wedding-reminder.ics";
      a.click();
      toast("일정 파일이 다운로드되었습니다. 파일을 열어 캘린더에 추가해 주세요.");
    }
  
    // 메모리 해제
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
      toast("링크가 복사되었습니다. Chrome/Safari 주소창에 붙여넣어 열어주세요.");
    } catch {
      toast("링크 복사에 실패했습니다.");
    }
  };

  const handleSms = () => {
    if (isSample) {
      toast("샘플 화면에서는 실제 문자 기능을 사용할 수 없습니다.");
      return;
    }
    const body = [
      "[결혼식 알림]",
      `일시: ${dateFormatted}`,
      `장소: ${location} (${address})`,
      `상세: ${detail}`,
      `지도: ${mapUrl}`,
    ].join("\n");

    const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
    const sep = isIOS ? "&" : "?";
    const href = `sms:${sep}body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  return (
    <div className="mt-16 mb-12">
      <div className="border border-rose-50 rounded-[2rem] overflow-hidden shadow-sm shadow-rose-50/20 bg-white p-8">
        <h3 className="font-serif text-xl font-bold text-gray-800 mb-2 tracking-tight">결혼식 전날 알림받기</h3>
        <p className="text-[13px] text-gray-500 font-sans mb-6">잊지 않으시도록 예식 24시간 전에 알려드려요.</p>

        {/* 푸시알람 섹션 — 절차를 이 섹션 안에 포함 */}
        <div className="mb-6 p-5 rounded-2xl bg-[#FBF7F4] border border-rose-50">
          <h4 className="font-bold text-[15px] text-gray-800 mb-1.5 flex items-center gap-2">🔔 전날 푸시알람 받기</h4>
          <p className="text-[12px] text-gray-600 font-sans mb-3">캘린더에 일정을 저장하면 예식 24시간 전 알림을 받을 수 있어요.</p>
          <p className="text-[11px] text-amber-700 font-sans mb-3">카카오톡에서는 다운로드가 안 될 수 있어요. 링크 복사 후 브라우저에서 열어 진행해 주세요.</p>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-100/80 text-amber-900 text-[12px] font-bold font-sans border border-amber-200"
            >
              🔗 링크 복사
            </button>
            <button
              type="button"
              onClick={handlePushAlarm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-50/90 text-teal-800 text-[12px] font-bold font-sans border border-teal-200/80 hover:bg-teal-100/80 active:scale-[0.99] transition-colors"
            >
              푸시알람 받기
            </button>
          </div>
          <p className="text-[10px] text-gray-500">버튼을 누르면 wedding-reminder.ics가 다운로드돼요. 파일을 연 뒤 <strong>완료가 아니라 공유(↑) 버튼 → 캘린더에 추가</strong>를 선택해야 일정이 저장돼요.</p>
        </div>

        {/* 문자 섹션 */}
        <div className="p-5 rounded-2xl bg-[#FBF7F4] border border-rose-50">
          <h4 className="font-bold text-[15px] text-gray-800 mb-1.5 flex items-center gap-2">💬 전날 문자 받기</h4>
          <p className="text-[12px] text-gray-600 font-sans mb-3">문자 앱에 예약 발송하면 예식 전날 알림을 받을 수 있어요.</p>
          <button
            type="button"
            onClick={handleSms}
            className="w-full py-3 px-4 rounded-xl bg-teal-50/90 text-teal-800 text-[13px] font-bold font-sans border border-teal-200/80 hover:bg-teal-100/80 active:scale-[0.99] transition-colors"
          >
            문자 보내기
          </button>
          <p className="mt-2 text-[10px] text-gray-500">(안드로이드만 예약 발송 가능)</p>
        </div>
      </div>
    </div>
  );
}
