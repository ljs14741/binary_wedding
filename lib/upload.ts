// lib/upload.ts
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadFile(file: File | null): Promise<string> {
    // 1. 파일이 없으면 빈 문자열 반환
    if (!file || file.size === 0) return "";

    // 2. 파일 타입/크기 검증
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error(`지원하지 않는 파일 형식입니다. (허용: JPG, PNG, GIF, WebP)`);
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`파일 크기는 10MB 이하여야 합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. 저장할 경로 설정 (public/uploads 폴더)
    // process.cwd()는 프로젝트 루트 경로를 가져옵니다.
    const uploadDir = join(process.cwd(), "public", "uploads");

    try {
        // 폴더가 없으면 생성 (recursive: true는 상위 폴더까지 같이 생성)
        await mkdir(uploadDir, { recursive: true });
    } catch (error) {
        // 폴더가 이미 있으면 에러 무시
    }

    // 5. 유니크한 파일명 생성 (MIME 기준 확장자로 보안)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const mimeToExt: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" };
    const ext = mimeToExt[file.type] ?? "jpg";
    const filename = `${uniqueSuffix}.${ext}`;

    const filepath = join(uploadDir, filename);

    // 6. 파일 쓰기
    await writeFile(filepath, buffer);

    return `/uploads/${filename}`;
}