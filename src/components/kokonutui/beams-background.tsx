"use client";

/**
 * @description: Static Beams Background (0% CPU, no animation loop)
 * Frozen in the exact position of the brand green to aqua blue gradient beams.
 * Configurable position: "left" (default) or "right".
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface AnimatedGradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
  position?: "left" | "right";
}

export function BeamsBackground({
  className,
  children,
  intensity = "medium",
  position = "left",
}: AnimatedGradientBackgroundProps) {
  const opacityMultiplier =
    intensity === "subtle" ? "opacity-60" : intensity === "strong" ? "opacity-100" : "opacity-85";

  const isLeft = position === "left";

  return (
    <div
      className={cn(
        "relative overflow-hidden pointer-events-none select-none",
        className
      )}
    >
      {/* 
        Faisceaux et auras statiques fixés sans boucle d'animation (0% CPU).
        Dégradé positionné à gauche (par défaut) ou à droite, partant de notre vert de marque (#02b282)
        vers un bleu aqua éclatant (#00d2d3 / #06b6d4).
      */}
      <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", opacityMultiplier)}>
        {/* Halo d'ambiance d'arrière-plan doux vert & aqua */}
        <div 
          className={cn(
            "absolute -top-[15%] w-[680px] h-[580px] rounded-full blur-[85px]",
            isLeft 
              ? "left-[-5%] bg-gradient-to-br from-[#02b282]/15 via-[#14b8a6]/20 to-[#00d2d3]/25 dark:from-[#02b282]/25 dark:via-[#14b8a6]/30 dark:to-[#00d2d3]/35" 
              : "right-[-5%] bg-gradient-to-bl from-[#02b282]/15 via-[#14b8a6]/20 to-[#00d2d3]/25 dark:from-[#02b282]/25 dark:via-[#14b8a6]/30 dark:to-[#00d2d3]/35"
          )} 
        />

        {/* Faisceau 1 : Vert de marque incliné (délimite le début du dégradé vers le centre) */}
        <div 
          className={cn(
            "absolute -top-[25%] w-[130px] sm:w-[160px] h-[160%] bg-gradient-to-b from-transparent via-[#02b282]/25 dark:via-[#02b282]/35 to-transparent blur-[45px]",
            isLeft ? "left-[28%] rotate-[28deg]" : "right-[28%] -rotate-[28deg]"
          )} 
        />

        {/* Faisceau 2 : Transition émeraude / turquoise */}
        <div 
          className={cn(
            "absolute -top-[30%] w-[160px] sm:w-[200px] h-[170%] bg-gradient-to-b from-transparent via-[#10b981]/25 to-[#06b6d4]/25 dark:via-[#10b981]/35 dark:to-[#06b6d4]/35 blur-[52px]",
            isLeft ? "left-[16%] rotate-[30deg]" : "right-[16%] -rotate-[30deg]"
          )} 
        />

        {/* Faisceau 3 : Bleu aqua lumineux */}
        <div 
          className={cn(
            "absolute -top-[25%] w-[170px] sm:w-[230px] h-[160%] bg-gradient-to-b from-transparent via-[#06b6d4]/30 to-[#00d2d3]/25 dark:via-[#06b6d4]/40 dark:to-[#00d2d3]/35 blur-[58px]",
            isLeft ? "left-[2%] rotate-[32deg]" : "right-[2%] -rotate-[32deg]"
          )} 
        />

        {/* Faisceau 4 : Accent subtil en bordure extérieure */}
        <div 
          className={cn(
            "absolute -top-[15%] w-[120px] sm:w-[170px] h-[150%] bg-gradient-to-b from-transparent via-[#14b8a6]/20 to-transparent blur-[50px]",
            isLeft ? "-left-[8%] rotate-[28deg]" : "-right-[8%] -rotate-[28deg]"
          )} 
        />
      </div>

      {children && <div className="relative z-10 pointer-events-auto">{children}</div>}
    </div>
  );
}

export default BeamsBackground;
