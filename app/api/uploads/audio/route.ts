import { NextResponse } from "next/server";
import { uploadAudioFile } from "@/lib/upload";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
    try {
        // 디스크 채우기 방지: IP 기반 제한
        const ip = await getClientIp();
        const { limited, message: limitMsg } = await checkRateLimit("uploadAudio", ip);
        if (limited) {
            return NextResponse.json({ success: false, message: limitMsg }, { status: 429 });
        }

        const formData = await req.formData();
        const file = formData.get("file");
        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json({ success: false, message: "업로드할 파일이 없습니다." }, { status: 400 });
        }

        const url = await uploadAudioFile(file);
        return NextResponse.json({ success: true, url });
    } catch (error) {
        const message = error instanceof Error ? error.message : "음악 업로드 중 오류가 발생했습니다.";
        return NextResponse.json({ success: false, message }, { status: 400 });
    }
}
