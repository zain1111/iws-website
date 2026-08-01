import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AdSlot from "../components/AdSlot";
import Reveal from "../components/Reveal";
import SplitText from "../components/SplitText";
import { blogImageUrl, formatPostDate } from "../lib/blog";
import { EASE } from "../lib/motion";
import { supabase } from "../lib/supabase";
import type { BlogAdSlot, BlogPost } from "../types/database";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [listingAd, setListingAd] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [p, ads] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false }),
        supabase.from("blog_ad_slots").select("*").eq("slot_key", "listing_banner").maybeSingle(),
      ]);
      setPosts((p.data as BlogPost[]) ?? []);
      setListingAd(((ads.data as BlogAdSlot | null)?.ad_code ?? "").trim());
      setLoading(false);
    })();
  }, []);

  const [featured, ...rest] = posts;

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 pt-40 pb-20 lg:pt-48 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-16 w-[420px] h-[520px] bg-gradient-to-br from-coral-500 to-navy-700 facet-cut opacity-70" />
          <div className="absolute -bottom-28 -left-20 w-[360px] h-[400px] bg-gradient-to-tl from-sky-400 to-blue-600 facet-cut-rev opacity-40" />
          <div className="absolute inset-0 bg-navy-900/35" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-mono text-sm text-sky-400 mb-6"
          >
            <span className="text-coral-500">//</span> field notes
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display font-semibold text-white text-5xl sm:text-6xl lg:text-7xl tracking-tight max-w-3xl leading-[0.98]"
          >
            <SplitText>Ideas we ship between builds.</SplitText>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mt-6 max-w-xl text-slate-300 text-lg leading-relaxed"
          >
            Practical notes on design, engineering, and shipping websites that convert — written
            from the studio floor.
          </motion.p>
        </div>
      </section>

      <section className="bg-paper py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-12">
          {listingAd && (
            <Reveal>
              <AdSlot code={listingAd} label="Sponsored" className="mx-auto max-w-4xl" />
            </Reveal>
          )}

          {loading && (
            <p className="font-mono text-sm text-slate-400">Loading articles…</p>
          )}

          {!loading && posts.length === 0 && (
            <p className="font-display text-slate-500">No published articles yet. Check back soon.</p>
          )}

          {featured && (
            <Reveal>
              <Link
                to={`/blog/${featured.slug}`}
                className="group grid lg:grid-cols-12 gap-0 overflow-hidden rounded-[2rem] border border-navy-900/10 bg-white hover:border-navy-900/25 transition-colors"
              >
                <div className="relative lg:col-span-7 min-h-[280px] lg:min-h-[420px] bg-navy-900 overflow-hidden">
                  {blogImageUrl(featured.featured_image_path) ? (
                    <img
                      src={blogImageUrl(featured.featured_image_path)!}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-coral-500/40" />
                  )}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-coral-500" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
                  <span className="absolute bottom-5 left-5 font-mono text-[11px] uppercase tracking-widest text-white/90 bg-navy-900/70 px-3 py-1.5 rounded-full">
                    Latest
                  </span>
                </div>
                <div className="lg:col-span-5 flex flex-col justify-center p-8 lg:p-12">
                  <p className="font-mono text-xs text-coral-500 mb-3">
                    {formatPostDate(featured.published_at)}
                  </p>
                  <h2 className="font-display text-3xl lg:text-4xl text-navy-900 leading-tight group-hover:text-coral-500 transition-colors">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="mt-4 text-slate-500 leading-relaxed">{featured.excerpt}</p>
                  )}
                  <span className="mt-8 inline-flex items-center gap-2 font-display text-navy-900 border-b-2 border-coral-500 pb-1 w-fit">
                    Read article →
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          {rest.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, i) => (
                <Reveal key={post.id} delay={(i % 3) * 0.08}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-900/10 bg-white hover:border-navy-900/25 transition-colors"
                  >
                    <div className="relative aspect-[16/10] bg-navy-900 overflow-hidden">
                      {blogImageUrl(post.featured_image_path) ? (
                        <img
                          src={blogImageUrl(post.featured_image_path)!}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-navy-800 to-sky-600" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="font-mono text-[11px] text-coral-500 mb-2">
                        {formatPostDate(post.published_at)}
                      </p>
                      <h3 className="font-display text-xl text-navy-900 group-hover:text-coral-500 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-slate-500 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
