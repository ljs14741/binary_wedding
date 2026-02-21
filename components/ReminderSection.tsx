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
    const desc = `예식 시간: ${date.toLocaleString("ko-KR", { dateStyle: "long", timeStyle: "short" })} / 상세위치: ${detail} / 청첩장: ${invitationUrl}`;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${summary}`,
      `LOCATION:${loc.replace(/,/g, "\\,")}`,
      `DESCRIPTION:${desc.replace(/\n/g, "\\n")}`,
      `DTSTART:${icsDateStart}`,
      `DTEND:${icsDateEnd}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT1440M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${summary}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding-reminder.ics";
    a.click();
    URL.revokeObjectURL(url);
    toast("캘린더 일정이 다운로드되었습니다. 기기에서 추가 후 알림을 확인해주세요.");
  };

  const handleSms = () => {
    if (isSample) {
      toast("샘플 화면에서는 실제 문자 기능을 사용할 수 없습니다.");
      return;
    }
    const body = [
      "[내일 결혼식 알림]",
      `일시: ${dateFormatted}`,
      `장소: ${location} (${address})`,
      `상세: ${detail}`,
      `지도: ${mapUrl}`,
      "",
      "*이 문자를 전송해서 보관해두시면 내일 찾아오시기 편합니다!",
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
        <p className="text-[13px] text-gray-500 mb-6 font-sans">잊지 않으시도록 예식 24시간 전에 알려드려요.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePushAlarm}
            className="w-full py-4 px-6 bg-[#FBF7F4] text-[#B19888] rounded-2xl font-bold text-[15px] shadow-sm border border-rose-50 hover:bg-rose-50/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            🔔 전날 푸시알람 받기
          </button>
          <button
            onClick={handleSms}
            className="w-full py-4 px-6 bg-[#FBF7F4] text-[#B19888] rounded-2xl font-bold text-[15px] shadow-sm border border-rose-50 hover:bg-rose-50/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            💬 전날 문자 받기
          </button>
        </div>
      </div>
    </div>
  );
}
