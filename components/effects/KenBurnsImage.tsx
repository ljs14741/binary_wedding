"use client";

import React from "react";
import { motion } from "framer-motion";

interface KenBurnsImageProps {
  children: React.ReactNode;
  className?: string;
}

/** 시네마틱 Ken Burns (1.15배 확대 + 오른쪽 위로 미세 이동), 12초 부드러운 전환 */
export default function KenBurnsImage({ children, className = "" }: KenBurnsImageProps) {
  return (
    <motion.div
      initial={{ scale: 1, x: 0, y: 0 }}
      whileInView={{ scale: 1.15, x: 10, y: -10 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 12, ease: "easeInOut" }}
      className={`absolute inset-0 origin-center ${className}`}
    >
      {children}
    </motion.div>
  );
}
