import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        unoptimized: true,
        localPatterns: [{ pathname: "/uploads/**" }],
    },
    /* config options here */
};

export default nextConfig;