import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Scale, ShieldAlert, BookOpen, Newspaper, MapPin, Star, ArrowRight } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/layout/SiteChrome";
import { IMG, formatMoney, initials } from "@/lib/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TITLE = "LegalFinder — Find advocates, legal advice and court records";
const DESC =
  "Search verified advocates by practice area, read plain-language legal guides, browse court judgements, police stations and wanted notices — all in one place.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { data } = useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const [lawyers, advice, news, quotes, wanted, stations, judgements] = await Promise.all([
        supabase.from("lawyers").select("*").order("rating", { ascending: false }).limit(6),
        supabase.from("legal_advices").select("*").order("created_at", { ascending: false }).limit(4),
        supabase.from("news_posts").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("quotes").select("*").limit(1),
        supabase.from("wanted_persons").select("*").limit(4),
        supabase.from("police_stations").select("*").limit(6),
        supabase.from("judgements").select("*").order("delivered_on", { ascending: false }).limit(4),
      ]);
      return {
        lawyers: lawyers.data ?? [],
        advice: advice.data ?? [],
        news: news.data ?? [],
        quote: quotes.data?.[0] ?? null,
        wanted: wanted.data ?? [],
        stations: stations.data ?? [],
        judgements: judgements.data ?? [],
      };
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <img
          src={IMG.hero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/40" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-24 lg:grid-cols-[1.15fr_1fr] lg:py-32">
          <div>
            <Badge className="bg-crimson text-crimson-foreground hover:bg-crimson">
              Justice, made reachable
            </Badge>
            <h1 className="mt-5 font-display text-4xl leading-tight text-balance-tight sm:text-5xl lg:text-6xl">
              The law shouldn&apos;t be a maze.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/75">
              {DESC}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-crimson text-crimson-foreground hover:bg-crimson/90">
                <a href="#advocates">
                  Find an advocate <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <a href="#advice">Read legal guides</a>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-primary-foreground/15 pt-6">
              {[
                ["12+", "Verified advocates"],
                ["8", "Practice areas"],
                ["24/7", "Public safety desk"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="font-display text-2xl text-gold">{v}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-primary-foreground/60">{k}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative hidden lg:block">
            <img
              src={IMG.justice}
              alt="Scales of justice in a courtroom"
              className="h-full w-full rounded-2xl object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionHead
          eyebrow="What you can do"
          title="Five services, one platform"
          sub="Built for citizens, advocates, law enforcement and the judiciary."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Scale, img: IMG.lawyer, t: "Find an advocate", d: "Filter by practice area, county, fee and rating. Call, message or book directly.", href: "#advocates" },
            { icon: BookOpen, img: IMG.advices, t: "Legal advice", d: "Plain-language guides on arrest, land, employment, family and business law.", href: "#advice" },
            { icon: BookOpen, img: IMG.library, t: "Law library", d: "Court judgements and reference material uploaded by the judiciary.", href: "#library" },
            { icon: Newspaper, img: IMG.court, t: "News & security tips", d: "Legal developments and practical safety guidance you can act on.", href: "#news" },
            { icon: ShieldAlert, img: IMG.police, t: "Public safety", d: "Police station directory and active wanted notices near you.", href: "#safety" },
            { icon: Scale, img: IMG.tribunal, t: "Case & appointment desk", d: "Track your matters, documents and consultations in one private space.", href: "#advocates" },
          ].map((s) => (
            <a key={s.t} href={s.href} className="group">
              <Card className="h-full overflow-hidden border-border/70 py-0 transition-shadow hover:shadow-lift">
                <div className="relative h-32 overflow-hidden bg-primary">
                  <img
                    src={s.img}
                    alt=""
                    className="h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
                  />
                  <s.icon className="absolute bottom-3 left-4 h-6 w-6 text-primary-foreground" />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-display text-base font-bold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>

      {/* Advocates */}
      <section id="advocates" className="border-y border-border bg-surface paper">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionHead eyebrow="Directory" title="Verified advocates" sub="Every listing is checked before it appears here." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.lawyers ?? []).map((l) => (
              <Card key={l.id} className="border-border/70 transition-shadow hover:shadow-plate">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                      {initials(l.full_name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-bold">{l.full_name}</h3>
                      <p className="text-sm text-crimson">{l.field}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {l.county} · {l.years_experience} yrs
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{l.bio}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      {l.rating}
                      <span className="text-xs text-muted-foreground">({l.review_count})</span>
                    </span>
                    <span className="text-sm font-semibold">{formatMoney(l.hourly_rate, l.currency)}/hr</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advice */}
      <section id="advice" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHead eyebrow="Know your rights" title="Legal advice" sub="Written for people, not lawyers." />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {(data?.advice ?? []).map((a) => (
            <Card key={a.id} className="border-border/70">
              <CardContent className="p-6">
                <Badge variant="secondary">{a.category}</Badge>
                <h3 className="mt-3 font-display text-lg font-bold">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.summary}</p>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground/80">{a.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quote */}
      {data?.quote ? (
        <section className="border-y border-border bg-primary py-16 text-primary-foreground">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="mx-auto h-1 w-24 rounded rule-gold" />
            <blockquote className="mt-6 font-display text-2xl leading-snug text-balance-tight sm:text-3xl">
              “{data.quote.content}”
            </blockquote>
            <p className="mt-4 text-sm uppercase tracking-wider text-primary-foreground/60">
              {data.quote.author}
            </p>
          </div>
        </section>
      ) : null}

      {/* Library */}
      <section id="library" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHead eyebrow="Judiciary" title="Law library" sub="Recent judgements and rulings." />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {(data?.judgements ?? []).map((j) => (
            <Card key={j.id} className="border-border/70">
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {j.court} · {j.case_number}
                </p>
                <h3 className="mt-2 font-display text-base font-bold">{j.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{j.description}</p>
                {j.delivered_on ? (
                  <p className="mt-3 text-xs text-muted-foreground">Delivered {j.delivered_on}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* News */}
      <section id="news" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionHead eyebrow="Stay informed" title="News & security tips" sub="Updates and practical guidance." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {(data?.news ?? []).map((n) => (
              <Card key={n.id} className="border-border/70">
                <CardContent className="p-6">
                  <Badge className={n.kind === "tip" ? "bg-gold text-gold-foreground hover:bg-gold" : ""} variant={n.kind === "tip" ? "default" : "secondary"}>
                    {n.kind === "tip" ? "Security tip" : "News"}
                  </Badge>
                  <h3 className="mt-3 font-display text-base font-bold">{n.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHead eyebrow="Public safety" title="Stations & wanted notices" sub="Report an incident or help identify a suspect." />
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Police stations
            </h3>
            <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
              {(data?.stations ?? []).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.address}</p>
                  </div>
                  <a href={`tel:${s.phone}`} className="shrink-0 text-sm font-medium text-crimson">
                    {s.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Wanted notices
            </h3>
            <div className="mt-4 space-y-3">
              {(data?.wanted ?? []).map((w) => (
                <Card key={w.id} className="border-crimson/25 bg-crimson/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display font-bold">{w.name}</p>
                      <Badge className="bg-crimson text-crimson-foreground hover:bg-crimson">
                        {w.suspect_of}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{w.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {w.station} · Reward {formatMoney(w.reward)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-crimson">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-bold text-balance-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{sub}</p>
      <div className="mt-5 h-0.5 w-20 rounded rule-gold" />
    </div>
  );
}
