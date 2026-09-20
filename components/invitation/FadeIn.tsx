"use client";

import React from "react";
import { motion } from "framer-motion";

/** 스크롤 진입 시 아래에서 떠오르는 공통 등장 애니메이션 */
export default function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}
