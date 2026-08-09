import { useQuery } from "@tanstack/react-query";
import { listPublishedAds, type PublicAd } from "@/lib/public-ads.functions";

function AdCard({ ad, variant }: { ad: PublicAd; variant: "banner" | "card" | "video" }) {
  const media =
    ad.media_type === "video" ? (
      <video
        src={ad.media_url}
        className={variant === "banner" ? "h-full w-full object-cover" : "aspect-video w-full object-cover"}
        muted
        loop
        autoPlay
        playsInline
      />
    ) : (
      <img
        src={ad.media_url}
        alt={ad.titre}
        loading="lazy"
        className={variant === "banner" ? "h-full w-full object-cover" : "aspect-video w-full object-cover"}
      />
    );

  const inner = (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg">
      <div className={variant === "banner" ? "h-40 w-full overflow-hidden md:h-56" : "overflow-hidden"}>{media}</div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold">{ad.titre}</p>
          {ad.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ad.description}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Publicité
        </span>
      </div>
    </div>
  );

  return ad.lien_url ? (
    <a href={ad.lien_url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="block">
      {inner}
    </a>
  ) : (
    inner
  );
}

export function AdSlot({
  placement,
  title = "Nos annonceurs",
  limit = 3,
}: {
  placement: "banner" | "card" | "video" | "feed";
  title?: string;
  limit?: number;
}) {
  const { data } = useQuery({ queryKey: ["published-ads"], queryFn: () => listPublishedAds() });
  const ads = (data ?? []).filter((a) => a.placement === placement).slice(0, limit);
  if (!ads.length) return null;

  const variant = placement === "banner" ? "banner" : placement === "video" ? "video" : "card";

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className={placement === "banner" ? "grid gap-4" : "grid gap-4 md:grid-cols-3"}>
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} variant={variant} />
        ))}
      </div>
    </section>
  );
}
