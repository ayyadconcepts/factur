"use client";

/**
 * @author: @kokonutui (adapted for facturxfacile Hercules palette)
 * @description: Shape Hero with elegant floating geometric shapes
 * @license: MIT
 * @website: https://kokonutui.com
 */

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface ElegantShapeProps {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
  borderRadius?: number;
}

export function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-emerald-600/[0.15]",
  borderRadius = 16,
}: ElegantShapeProps) {
  return (
    <motion.div
      animate={{
        opacity: 1,
        y: 0,
        rotate,
      }}
      className={cn("absolute pointer-events-none", className)}
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96] as any,
        opacity: { duration: 1.2 },
      }}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        className="relative"
        style={{
          width,
          height,
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div
          className={cn(
            "absolute inset-0",
            "bg-linear-to-r to-transparent",
            gradient,
            "backdrop-blur-[1px]",
            "ring-1 ring-stone-900/[0.04] dark:ring-white/[0.04]",
            "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4)]",
            "after:absolute after:inset-0",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)] dark:after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_70%)]",
            "after:rounded-[inherit]"
          )}
          style={{ borderRadius }}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Background composed of animated floating shapes tuned to the Hercules palette (cream, stone, sage green)
 */
export function ShapeBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Halo ambient doux sans violet */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-600/[0.04] via-transparent to-amber-600/[0.03] dark:from-emerald-500/[0.06] dark:via-transparent dark:to-teal-500/[0.04] blur-3xl" />

      {/* Grand rectangle vertical en haut à gauche - vert émeraude */}
      <ElegantShape
        borderRadius={24}
        className="top-[-10%] left-[-15%]"
        delay={0.3}
        gradient="from-emerald-600/[0.18] dark:from-emerald-500/[0.25]"
        height={500}
        rotate={-8}
        width={300}
      />

      {/* Large rectangle en bas à droite - sage green officiel */}
      <ElegantShape
        borderRadius={20}
        className="right-[-20%] bottom-[-5%]"
        delay={0.5}
        gradient="from-[#02b282]/[0.16] dark:from-[#02b282]/[0.22]"
        height={200}
        rotate={15}
        width={550}
      />

      {/* Carré milieu gauche - pierre chaude */}
      <ElegantShape
        borderRadius={32}
        className="top-[35%] left-[-8%]"
        delay={0.4}
        gradient="from-stone-500/[0.14] dark:from-stone-400/[0.18]"
        height={280}
        rotate={22}
        width={280}
      />

      {/* Petit rectangle en haut à droite - ambre chaud */}
      <ElegantShape
        borderRadius={12}
        className="top-[6%] right-[8%]"
        delay={0.6}
        gradient="from-amber-600/[0.12] dark:from-amber-500/[0.16]"
        height={90}
        rotate={-18}
        width={220}
      />

      {/* Rectangle moyen centre droit - sarcelle/teal */}
      <ElegantShape
        borderRadius={16}
        className="top-[45%] right-[-10%]"
        delay={0.7}
        gradient="from-teal-600/[0.15] dark:from-teal-500/[0.20]"
        height={140}
        rotate={32}
        width={360}
      />

      {/* Petit carré en bas à gauche - sage green */}
      <ElegantShape
        borderRadius={24}
        className="bottom-[8%] left-[15%]"
        delay={0.2}
        gradient="from-[#02b282]/[0.15] dark:from-[#02b282]/[0.22]"
        height={180}
        rotate={-22}
        width={180}
      />
    </div>
  );
}

export default function ShapeHero({
  title1 = "La facturation",
  title2 = "électronique simplifiée",
  subtitle = "Générez des factures au format Factur-X conformes à la réglementation française.",
  children,
}: {
  title1?: string;
  title2?: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.3 + i * 0.15,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
      <ShapeBackground />

      <div className="container relative z-10 mx-auto px-4 md:px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            animate="visible"
            custom={1}
            initial="hidden"
            variants={fadeUpVariants as any}
          >
            <h1 className="mb-6 font-bold text-4xl tracking-tight sm:text-6xl md:text-7xl">
              <span className="text-foreground">
                {title1}
              </span>
              <br />
              <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {title2}
              </span>
            </h1>
          </motion.div>

          <motion.div
            animate="visible"
            custom={2}
            initial="hidden"
            variants={fadeUpVariants as any}
          >
            <p className="mx-auto mb-8 max-w-xl px-4 font-normal text-base text-muted-foreground leading-relaxed tracking-wide sm:text-lg">
              {subtitle}
            </p>
          </motion.div>

          {children}
        </div>
      </div>
    </div>
  );
}
