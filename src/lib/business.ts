// Details of the demo business running on Slotly. Change these to rebrand.
export const business = {
  name: "Glow Studio",
  tagline: "Hair, nails & grooming in Lekki, Lagos",
  address: "14 Admiralty Way, Lekki Phase 1, Lagos",
  // Fictional contact details. The .example domain is reserved and can never
  // receive mail, and the all-zero number avoids ringing a real person.
  // Replace both with real details for a real business.
  phone: "+234 800 000 0000",
  email: "hello@glowstudio.example",
  repoUrl: "https://github.com/charlesiduh001-alt/slotly",
};

/** Canonical site URL, used for share images and absolute links. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
