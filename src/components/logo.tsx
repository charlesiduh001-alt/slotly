/**
 * Glow Studio mark, drawn from the adire motif: an indigo tile (one square of
 * the adire grid) holding an oniko tie-dye ring around an eleko four-petal leaf,
 * which doubles as a "glow" bloom. Pure SVG so it stays crisp from 16px up.
 */

// One almond-shaped petal pointing up from the centre of a 64×64 box.
export const PETAL = "M32 30C25 24.6 25.4 15.2 32 11C38.6 15.2 39 24.6 32 30Z";

type Tone = "auto" | "footer";

export function LogoMark({ size = 36, tone = "auto", className }: { size?: number; tone?: Tone; className?: string }) {
  // "auto" follows the theme (deep indigo in light mode, brighter in dark);
  // the footer is always dark, so it uses the brighter indigo.
  const fill = tone === "footer" ? "#4f65b8" : "var(--c-accent-fill)";
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden
      focusable="false"
      className={`shrink-0 ${className ?? ""}`}
    >
      <rect width="64" height="64" rx="16" fill={fill} />
      <circle cx="32" cy="32" r="24" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" />
      {[0, 90, 180, 270].map((r) => (
        <path key={r} d={PETAL} fill="#ffffff" transform={`rotate(${r} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="2.6" fill={fill} />
    </svg>
  );
}

/** Standalone SVG string (fixed colours) for the favicon and generated images. */
export function logoSvg(fill = "#1b2a5e", ring = "#3d5299", radius = 16): string {
  const petals = [0, 90, 180, 270]
    .map((r) => `<path d='${PETAL}' fill='#ffffff' transform='rotate(${r} 32 32)'/>`)
    .join("");
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='64' height='64'><rect width='64' height='64' rx='${radius}' fill='${fill}'/><circle cx='32' cy='32' r='24' fill='none' stroke='${ring}' stroke-width='2'/>${petals}<circle cx='32' cy='32' r='2.6' fill='${fill}'/></svg>`;
}

export const logoDataUri = (fill?: string, ring?: string, radius?: number) =>
  `data:image/svg+xml,${encodeURIComponent(logoSvg(fill, ring, radius))}`;
