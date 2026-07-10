/** Full-bleed scroll home (boilerlab-style sections). */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-black text-foreground">
      {children}
    </div>
  );
}
