// Re-mounts on every navigation, so each page fades in. Pure CSS, so it
// works without JavaScript and respects "reduce motion".
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
