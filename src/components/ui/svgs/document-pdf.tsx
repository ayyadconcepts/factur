import type { SVGProps } from 'react'

export const DocumentPdf = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    width="130"
    height="160"
    viewBox="0 0 256 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <defs>
      {/* Ombre portée douce de la feuille blanche */}
      <filter id="tailark-doc-shadow" x="20" y="30" width="230" height="280" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#0F172A" floodOpacity="0.08" />
      </filter>

      {/* Lueur rouge intense sous la capsule */}
      <filter id="tailark-pill-glow" x="0" y="115" width="220" height="160" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#FB2C37" floodOpacity="0.55" />
      </filter>

      {/* Dégradé doux et soyeux de la feuille blanche */}
      <linearGradient id="tailark-doc-gradient" x1="138" y1="50" x2="138" y2="260" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.6" stopColor="#F8FAFC" />
        <stop offset="1" stopColor="#E2E8F0" />
      </linearGradient>

      {/* Dégradé rouge vif de la face de la capsule */}
      <linearGradient id="tailark-pill-gradient" x1="108" y1="150" x2="108" y2="237" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF3848" />
        <stop offset="1" stopColor="#F51428" />
      </linearGradient>
    </defs>

    {/* 1. Feuille blanche aux proportions exactes (large surface blanche au-dessus de la capsule) */}
    <g filter="url(#tailark-doc-shadow)">
      <rect
        x="57"
        y="50"
        width="163"
        height="210"
        rx="40"
        fill="url(#tailark-doc-gradient)"
        stroke="#E2E8F0"
        strokeWidth="1.5"
      />
    </g>

    {/* 2. Capsule rouge positionnée dans la partie inférieure avec débordement gauche exact */}
    <g filter="url(#tailark-pill-glow)">
      {/* Rebord supérieur 3D foncé (#C20008) */}
      <rect
        x="40"
        y="160"
        width="136"
        height="64"
        rx="32"
        fill="#C20008"
      />
      {/* Face principale rouge vif décalée vers le bas */}
      <rect
        x="40"
        y="163"
        width="136"
        height="61"
        rx="30.5"
        fill="url(#tailark-pill-gradient)"
      />
    </g>

    {/* 3. Typographie "PDF" blanche grasse, centrée au pixel près */}
    <text
      x="108"
      y="194"
      fill="#FFFFFF"
      fontSize="26"
      fontWeight="700"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      textAnchor="middle"
      dominantBaseline="central"
      letterSpacing="0.5"
    >
      PDF
    </text>
  </svg>
)

export default DocumentPdf
