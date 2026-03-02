import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// Turbopack 등에서 .env 로드 누락 시 fallback: .env 파일 직접 파싱
function loadAdminSecret(): string {
    const fromEnv = process.env.ADMIN_SECRET;
    if (fromEnv && fromEnv.length >= 12) return fromEnv;
    const cwd = process.cwd();
    for (const name of [".env", ".env.local"]) {
        const fp = path.resolve(cwd, name);
        try {
            if (fs.existsSync(fp)) {
                const content = fs.readFileSync(fp, "utf-8");
                const m = content.match(/ADMIN_SECRET\s*=\s*(.+)/m);
                if (m) {
                    const v = m[1].trim().replace(/^["']|["']\s*$/g, "");
                    if (v.length >= 12) return v;
                }
            }
        } catch {
            /* ignore */
        }
    }
    return "";
}

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        unoptimized: true,
        localPatterns: [{ pathname: "/uploads/**" }],
    },
    env: {
        ADMIN_SECRET: loadAdminSecret(),
    },
};

export default nextConfig;