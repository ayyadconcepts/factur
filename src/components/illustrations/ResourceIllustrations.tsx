import React from 'react'

export function DotWaveIllustration() {
  // Generates halftone dot matrix wave similar to Tailark Quartz top card
  const cols = 26
  const rows = 12
  const dots: { cx: number; cy: number; r: number; opacity: number }[] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 30 + c * 24
      // Sinusoidal wave distortion
      const wave = Math.sin((c / cols) * Math.PI * 2.2 + r * 0.25)
      const y = 40 + r * 14 + wave * 22
      // Radial or wave-based radius
      const dist = Math.abs(wave)
      const radius = 1 + dist * 2.2
      const opacity = 0.25 + dist * 0.7
      dots.push({ cx: x, cy: y, r: radius, opacity })
    }
  }

  return (
    <svg
      viewBox="0 0 680 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-contain select-none"
    >
      <rect width="680" height="260" fill="transparent" />
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          className="fill-foreground"
          opacity={d.opacity}
        />
      ))}
    </svg>
  )
}

export function ContourWaveIllustration() {
  // Flowing ribbon lines similar to Tailark Quartz card 2
  return (
    <svg
      viewBox="0 0 680 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-contain select-none"
    >
      <rect width="680" height="260" fill="transparent" />
      {[...Array(18)].map((_, i) => {
        const offset = i * 4.5
        const d = `M 30,${160 - offset * 0.6} C 160,${80 + offset} 280,${220 - offset} 420,${110 + offset * 0.8} C 520,${40 + offset} 600,${150 - offset * 0.4} 660,${130}`
        return (
          <path
            key={i}
            d={d}
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray={i % 3 === 0 ? '2 2' : undefined}
            className="text-foreground"
            opacity={0.15 + (i / 18) * 0.65}
          />
        )
      })}
    </svg>
  )
}

export function RadialDotsIllustration() {
  // Concentric radial halftone dispersal similar to Tailark Quartz card 3
  const rings = 8
  const dots: { cx: number; cy: number; r: number; opacity: number }[] = []
  const centerX = 340
  const centerY = 130

  // Center dense cluster
  dots.push({ cx: centerX, cy: centerY, r: 4.5, opacity: 0.95 })

  for (let ring = 1; ring <= rings; ring++) {
    const radius = ring * 14
    const count = ring * 8
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const cx = centerX + Math.cos(angle) * radius
      const cy = centerY + Math.sin(angle) * (radius * 0.75) // subtle elliptical perspective
      const r = Math.max(0.8, 3.8 - ring * 0.38)
      const opacity = Math.max(0.12, 0.9 - ring * 0.1)
      dots.push({ cx, cy, r, opacity })
    }
  }

  return (
    <svg
      viewBox="0 0 680 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-contain select-none"
    >
      <rect width="680" height="260" fill="transparent" />
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          className="fill-foreground"
          opacity={d.opacity}
        />
      ))}
    </svg>
  )
}

export function IridescentFlowIllustration() {
  // Vibrant chromatic gradient blend similar to Tailark Quartz card 4
  return (
    <svg
      viewBox="0 0 680 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-cover select-none"
    >
      <defs>
        <linearGradient id="iridescent-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#818cf8" />
          <stop offset="70%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <radialGradient id="iridescent-blur" cx="70%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#9333ea" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="680" height="260" fill="url(#iridescent-grad-1)" />
      <rect width="680" height="260" fill="url(#iridescent-blur)" style={{ mixBlendMode: 'multiply' }} />
      {/* Dynamic light crescent */}
      <path
        d="M 0,260 C 240,160 440,60 680,20 L 680,260 Z"
        fill="white"
        opacity="0.12"
      />
      <path
        d="M 0,260 C 180,200 380,120 680,80"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.35"
      />
    </svg>
  )
}

export function WireframeHelixIllustration() {
  // Geometric crystalline / DNA wireframe similar to Tailark Quartz card 5
  return (
    <svg
      viewBox="0 0 680 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-contain select-none"
    >
      <rect width="680" height="260" fill="transparent" />
      <g transform="translate(190, 20) scale(0.9)">
        {/* Isometric crystal nodes and connecting edges */}
        {[...Array(14)].map((_, i) => {
          const y = 20 + i * 16
          const wave1 = Math.sin((i / 14) * Math.PI * 2) * 55
          const wave2 = -wave1
          const x1 = 160 + wave1
          const x2 = 160 + wave2

          return (
            <g key={i}>
              {/* Rung */}
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y + 6}
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-foreground"
                opacity={0.3}
              />
              {/* Nodes */}
              <circle
                cx={x1}
                cy={y}
                r="3.2"
                className="fill-foreground"
                opacity={0.8}
              />
              <circle
                cx={x2}
                cy={y + 6}
                r="3.2"
                className="fill-foreground"
                opacity={0.8}
              />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export function SineMeshIllustration() {
  // Undulating dot matrix ribbon similar to Tailark Quartz card 6
  const cols = 28
  const rows = 10
  const dots: { cx: number; cy: number; r: number; opacity: number }[] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 25 + c * 23
      const wave = Math.cos((c / cols) * Math.PI * 2.8 + r * 0.3)
      const y = 50 + r * 15 + wave * 18
      const dist = Math.abs(wave)
      const radius = 1 + dist * 2
      const opacity = 0.2 + dist * 0.75
      dots.push({ cx: x, cy: y, r: radius, opacity })
    }
  }

  return (
    <svg
      viewBox="0 0 680 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-contain select-none"
    >
      <rect width="680" height="260" fill="transparent" />
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          className="fill-foreground"
          opacity={d.opacity}
        />
      ))}
    </svg>
  )
}

export function ResourceIllustration({
  type,
}: {
  type: 'dot-wave' | 'contour-wave' | 'radial-dots' | 'iridescent-flow' | 'wireframe-helix' | 'sine-mesh'
}) {
  switch (type) {
    case 'dot-wave':
      return <DotWaveIllustration />
    case 'contour-wave':
      return <ContourWaveIllustration />
    case 'radial-dots':
      return <RadialDotsIllustration />
    case 'iridescent-flow':
      return <IridescentFlowIllustration />
    case 'wireframe-helix':
      return <WireframeHelixIllustration />
    case 'sine-mesh':
      return <SineMeshIllustration />
    default:
      return <DotWaveIllustration />
  }
}
