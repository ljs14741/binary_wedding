// lib/upload.ts
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB (클라이언트 processImage로 압축됨)
const UPLOADS_BASE = "public/uploads";

/**
 * 파일 업로드 - 청첩장별 폴더 구조로 저장
 * @param file - 업로드할 파일 (null/empty 시 "" 반환)
 * @param subPath - 하위 경로 (예: "abc12/main", "abc12/gallery") - 청첩장 url_id/용도
 */
export async function uploadFile(file: File | null, subPath?: string): Promise<string> {
    if (!file || file.size === 0) return "";

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error(`지원하지 않는 파일 형식입니다. (허용: JPG, PNG, GIF, WebP)`);
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`파일 크기는 15MB 이하여야 합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    }

    // subPath 검증: url_id/용도 형식만 허용 (path traversal 방지)
    const safePath = subPath && /^[a-zA-Z0-9]{6,12}\/(main|middle|gallery|og)$/.test(subPath) ? subPath : "temp";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), UPLOADS_BASE, safePath);

    await mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const mimeToExt: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" };
    const ext = mimeToExt[file.type] ?? "jpg";
    const filename = `${uniqueSuffix}.${ext}`;

    await writeFile(join(uploadDir, filename), buffer);

    return `/uploads/${safePath}/${filename}`;
}

/** 청첩장 삭제 시 해당 url_id의 업로드 폴더 전체 삭제 */
export async function deleteInvitationUploads(url_id: string): Promise<void> {
    const folderPath = join(process.cwd(), UPLOADS_BASE, url_id);
    try {
        await rm(folderPath, { recursive: true });
    } catch {
        // 폴더가 없거나 권한 문제 시 무시
    }
}