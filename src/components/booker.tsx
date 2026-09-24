import { business } from "@/lib/business";
import { formatDuration, formatPrice } from "@/lib/format";
import { formatDate, formatMinutes } from "@/lib/time";

/** Business mark: solid circle with the initial (inverts in dark mode). */
export function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-primary font-display text-on-primary ${
        size === "sm" ? "size-7 text-[15px]" : "size-9 text-[18px]"
      }`}
    >
      {business.name[0]}
    </span>
  );
}

type ServiceSummary = { name: string; description?: string; durationMin: number; priceKobo: number };

/**
 * Left pane of the booking widget: who you're booking with and what.
 * Optionally shows the chosen date and time once selected.
 */
export function EventDetails({
  service,
  date,
  startMin,
  children,
}: {
  service: ServiceSummary;
  date?: string;
  startMin?: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2.5">
        <BrandMark size="sm" />
        <span className="body-sm font-medium text-muted">{business.name}</span>
      </div>
      <h1 className="mt-4 title-lg">{service.name}</h1>
      {service.description && <p className="mt-2 body-sm text-muted">{service.description}</p>}
      <ul className="mt-5 space-y-3 body-sm text-body">
        {date && startMin !== undefined && (
          <DetailRow icon="calendar">
            <span className="font-medium text-ink">
              {formatDate(date)}
              <br />
              {formatMinutes(startMin)} – {formatMinutes(startMin + service.durationMin)}
            </span>
          </DetailRow>
        )}
        <DetailRow icon="clock">{formatDuration(service.durationMin)}</DetailRow>
        <DetailRow icon="price">
          {service.priceKobo ? (
            <>
              {formatPrice(service.priceKobo)}
              <span className="text-muted"> · pay at the studio</span>
            </>
          ) : (
            "Free"
          )}
        </DetailRow>
        <DetailRow icon="pin">{business.address}</DetailRow>
      </ul>
      {children}
    </div>
  );
}

const ICONS = {
  clock: <path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  price: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
};

function DetailRow({ icon, children }: { icon: keyof typeof ICONS; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {ICONS[icon]}
      </svg>
      <span>{children}</span>
    </li>
  );
}
