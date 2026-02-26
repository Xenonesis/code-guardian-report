"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export const AnimatedScoreRing: React.FC<AnimatedScoreRingProps> = ({
  score,
  size = 80,
  strokeWidth = 6,
  label,
  className = "",
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getGradientId = `score-gradient-${label?.replace(/\s/g, "-") || "default"}`;

  const getColors = (s: number) => {
    if (s >= 80)
      return {
        start: "#10b981",
        end: "#059669",
        trail: "rgba(16,185,129,0.12)",
      };
    if (s >= 60)
      return {
        start: "#f59e0b",
        end: "#d97706",
        trail: "rgba(245,158,11,0.12)",
      };
    if (s >= 40)
      return {
        start: "#f97316",
        end: "#ea580c",
        trail: "rgba(249,115,22,0.12)",
      };
    return { start: "#ef4444", end: "#dc2626", trail: "rgba(239,68,68,0.12)" };
  };

  const colors = getColors(score);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="drop-shadow-sm">
        <defs>
          <linearGradient
            id={getGradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.trail}
          strokeWidth={strokeWidth}
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${getGradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      </svg>
      {/* Center score value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-foreground text-lg leading-none font-bold tabular-nums"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {animatedScore}
        </motion.span>
      </div>
      {label && (
        <span className="text-muted-foreground mt-1.5 text-[10px] font-semibold tracking-wider uppercase">
          {label}
        </span>
      )}
    </div>
  );
};
