/**
 * Brand illustration for the auth panel: a phone with an order on its way.
 * Inline SVG drawn from the theme tokens, so it recolours with the palette
 * instead of shipping a light-mode-only raster.
 */
export function AuthIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      className={className}
      role="img"
      aria-label="A phone showing a Mojjo delivery on its way"
    >
      {/* Ground shadow */}
      <ellipse cx="120" cy="176" rx="86" ry="10" fill="currentColor" opacity="0.08" />

      {/* Phone body */}
      <rect
        x="78"
        y="34"
        width="84"
        height="136"
        rx="12"
        fill="var(--surface)"
        stroke="var(--border-strong)"
        strokeWidth="2"
      />
      <rect x="106" y="42" width="28" height="4" rx="2" fill="var(--border-strong)" />

      {/* Screen */}
      <rect x="86" y="54" width="68" height="108" rx="6" fill="var(--surface-sunken)" />

      {/* Order card on screen */}
      <rect x="94" y="64" width="52" height="30" rx="4" fill="var(--primary)" opacity="0.9" />
      <rect x="100" y="72" width="24" height="4" rx="2" fill="var(--on-primary)" opacity="0.9" />
      <rect x="100" y="81" width="34" height="4" rx="2" fill="var(--on-primary)" opacity="0.5" />

      {/* Progress rows */}
      <rect x="94" y="102" width="52" height="4" rx="2" fill="var(--border-strong)" />
      <rect x="94" y="112" width="36" height="4" rx="2" fill="var(--border-strong)" />
      <rect x="94" y="122" width="44" height="4" rx="2" fill="var(--border-strong)" />

      {/* Confirmation tick */}
      <circle cx="120" cy="146" r="11" fill="var(--secondary)" />
      <path
        d="M115 146.5l3.5 3.5 6.5-7"
        stroke="var(--on-secondary)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottle, left */}
      <path
        d="M42 96h18v46a6 6 0 0 1-6 6H48a6 6 0 0 1-6-6V96z"
        fill="var(--accent)"
        opacity="0.9"
      />
      <rect x="47" y="80" width="8" height="18" rx="2" fill="var(--accent)" opacity="0.6" />
      <rect x="44" y="112" width="14" height="12" rx="2" fill="var(--on-accent)" opacity="0.25" />

      {/* Bag, right */}
      <path
        d="M180 112h32v30a6 6 0 0 1-6 6h-20a6 6 0 0 1-6-6v-30z"
        fill="var(--secondary)"
        opacity="0.85"
      />
      <path
        d="M188 112v-6a8 8 0 0 1 16 0v6"
        stroke="var(--secondary)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Speed marks */}
      <path
        d="M20 60h22M28 72h14M14 48h16"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
