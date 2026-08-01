import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import AdSlot from "../components/AdSlot";
import { openCalendlyPopup } from "../lib/calendly";
import {
  blogImageUrl,
  formatPostDate,
  parseBlogContent,
  postFiverrUrl,
  postUpworkUrl,
} from "../lib/blog";
import { applyBlogPostSeo } from "../lib/seo";
import { supabase } from "../lib/supabase";
import type { BlogAdSlot, BlogPost } from "../types/database";
import { CONTACT } from "../data/contact";

function slotMap(rows: BlogAdSlot[]) {
  const map: Record<string, string> = {};
  for (const row of rows) map[row.slot_key] = row.ad_code ?? "";
  return map;
}

export default function BlogPostPage() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [ads, setAds] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [p, a] = await Promise.all([
        supabase.from("blog_posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle(),
        supabase.from("blog_ad_slots").select("*"),
      ]);
      if (p.error) setError(p.error.message);
      setPost((p.data as BlogPost | null) ?? null);
      setAds(slotMap((a.data as BlogAdSlot[]) ?? []));
      setLoading(false);
    })();
  }, [slug]);

  const blocks = useMemo(() => (post ? parseBlogContent(post.content) : []), [post]);
  const mid = Math.max(1, Math.floor(blocks.length / 2));
  const beforeAd = blocks.slice(0, mid);
  const afterAd = blocks.slice(mid);
  const image = blogImageUrl(post?.featured_image_path);

  useEffect(() => {
    if (!post) return;
    return applyBlogPostSeo({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      focus_keyword: post.focus_keyword,
      featured_image_url: image,
      published_at: post.published_at,
      updated_at: post.updated_at,
    });
  }, [post, image]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-paper pt-32">
        <p className="font-mono text-sm text-slate-400">Loading article…</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-paper pt-32 px-6">
        <p className="font-display text-2xl text-navy-900 mb-4">Article not found</p>
        <Link to="/blog" className="font-display text-coral-500 hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="bg-paper">
      {/* Masthead — title bleeds over a slanted media plane */}
      <header className="relative bg-navy-900 pt-36 pb-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,90,69,0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(92,176,229,0.25), transparent 35%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24">
          <Link
            to="/blog"
            className="font-mono text-xs text-sky-400 hover:text-coral-400 transition-colors"
          >
            ← All field notes
          </Link>
          <p className="font-mono text-xs text-coral-400 mt-8 mb-4 uppercase tracking-[0.2em]">
            {formatPostDate(post.published_at)}
          </p>
          <h1 className="font-display font-semibold text-white text-4xl sm:text-5xl lg:text-6xl max-w-4xl leading-[1.05]">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-6 max-w-2xl text-slate-300 text-lg leading-relaxed">{post.excerpt}</p>
          )}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="relative -mb-16 lg:-mb-24 aspect-[21/9] overflow-hidden rounded-t-[2rem] border border-white/10 bg-navy-800">
            {image ? (
              <img
                src={image}
                alt={post.image_alt || post.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-coral-500/50 to-navy-800" />
            )}
            <div
              className="absolute top-0 right-0 w-24 h-24 bg-coral-500"
              style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
            />
          </div>
        </div>
      </header>

      {/* Body: article river + sticky hire rail */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-28 lg:pt-36 pb-20">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-12 lg:gap-16 items-start">
          <div className="min-w-0">
            <div className="prose-blog space-y-6 max-w-3xl">
              {beforeAd.map((block, i) => (
                <ContentBlock key={`a-${i}`} block={block} />
              ))}
            </div>

            <div className="my-12 relative">
              <div
                className="absolute -inset-x-4 -inset-y-3 bg-navy-900/[0.03] -skew-y-1 rounded-2xl"
                aria-hidden
              />
              <div className="relative py-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3 text-center">
                  Sponsored
                </p>
                <AdSlot code={ads.post_inline ?? ""} label="Ad — mid article" />
              </div>
            </div>

            <div className="prose-blog space-y-6 max-w-3xl">
              {afterAd.map((block, i) => (
                <ContentBlock key={`b-${i}`} block={block} />
              ))}
            </div>

            <div className="mt-14">
              <AdSlot code={ads.post_bottom ?? ""} label="Ad — before CTA" className="max-w-3xl" />
            </div>
          </div>

          {/* Unique hire rail — stacked “ticket” cards, not a generic sticky sidebar */}
          <aside className="lg:sticky lg:top-28 space-y-4">
            <div className="rounded-2xl bg-navy-900 text-white p-5 relative overflow-hidden">
              <div
                className="absolute -right-6 -top-6 w-24 h-24 bg-coral-500/30 rounded-full blur-2xl"
                aria-hidden
              />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300 relative">
                Hire the team
              </p>
              <p className="font-display text-xl mt-2 relative">Work with IWS</p>
              <p className="text-sm text-slate-300 mt-2 relative leading-relaxed">
                Need a site that ships? Grab a gig or start a contract — same people who wrote this.
              </p>
            </div>

            <a
              href={postFiverrUrl(post)}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border border-navy-900/10 bg-white p-5 hover:border-[#1dbf73] transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#1dbf73]">
                  Fiverr
                </span>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-[#1dbf73]" />
              </div>
              <p className="font-display text-navy-900 mt-2">Featured gig</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Book a delivery on Fiverr — fast scoping, clear milestones.
              </p>
            </a>

            <AdSlot code={ads.post_sidebar ?? ""} label="Ad — sidebar" />

            <a
              href={postUpworkUrl(post)}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border border-navy-900/10 bg-white p-5 hover:border-[#14a800] transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#14a800]">
                  Upwork
                </span>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-[#14a800]" />
              </div>
              <p className="font-display text-navy-900 mt-2">Zain Azeem</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Top-rated freelancing profile — long-term builds welcome.
              </p>
            </a>

            <a
              href={CONTACT.calendlyUrl}
              onClick={(e) => {
                e.preventDefault();
                void openCalendlyPopup("blog_sidebar");
              }}
              className="block text-center rounded-full bg-coral-500 text-white font-display text-sm px-5 py-3 hover:bg-navy-900 transition-colors"
            >
              Book a free call
            </a>
          </aside>
        </div>
      </div>

      {/* End funnel */}
      <section className="relative overflow-hidden bg-coral-500 py-20 lg:py-24">
        <div
          className="absolute left-0 top-0 w-40 h-40 bg-navy-900/15"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <p className="font-mono text-sm text-navy-900/70 mb-3">// next step</p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-white leading-tight">
            Liked this? Let&apos;s turn the idea into a live product.
          </h2>
          <p className="mt-4 text-white/90 max-w-lg mx-auto">
            Free 30-minute strategy call — scope, timeline, and cost, straight answers.
          </p>
          <button
            type="button"
            onClick={() => void openCalendlyPopup("blog_footer")}
            className="mt-8 inline-flex items-center gap-2 bg-navy-900 text-white font-display font-medium px-8 py-4 rounded-full hover:bg-white hover:text-navy-900 transition-colors"
          >
            Book a free consultation
            <span aria-hidden>→</span>
          </button>
        </div>
      </section>
    </article>
  );
}

function ContentBlock({
  block,
}: {
  block: ReturnType<typeof parseBlogContent>[number];
}) {
  if (block.type === "h2") {
    return <h2 className="font-display text-2xl lg:text-3xl text-navy-900 pt-4">{block.text}</h2>;
  }
  if (block.type === "h3") {
    return <h3 className="font-display text-xl text-navy-900 pt-2">{block.text}</h3>;
  }
  if (block.type === "quote") {
    return (
      <blockquote className="border-l-4 border-coral-500 pl-5 py-1 font-display text-xl text-navy-900/90 italic">
        {block.text}
      </blockquote>
    );
  }
  if (block.type === "ul") {
    return (
      <ul className="space-y-2 pl-1">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3 text-slate-600 leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-slate-600 text-lg leading-[1.75]">{block.text}</p>;
}
