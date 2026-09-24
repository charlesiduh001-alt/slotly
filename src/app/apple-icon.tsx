import { ImageResponse } from "next/og";
import { logoDataUri } from "@/components/logo";

// Home-screen icon for iOS ("Add to Home Screen"). Square corners: iOS applies its own mask.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoDataUri(undefined, undefined, 0)} width={180} height={180} alt="" />
    ),
    size,
  );
}
