import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { blogImageUrl, slugify, RESERVED_PATHS } from "../../lib/blog";
import { supabase } from "../../lib/supabase";
import type { BlogPost, BlogPostStatus } from "../../types/database";

type FormMode = "create" | "edit";
type View = "list" | "form";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  status: "draft" as BlogPostStatus,
  fiverr_url: "",
  upwork_url: "",
  featured_image_path: "" as string | null,
  meta_title: "",
  meta_description: "",
  focus_keyword: "",
  image_alt: "",
};

export default function AdminBlogPage() {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<View>("list");
  const [mode, setMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    setPosts((data as BlogPost[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isAdmin) return <Navigate to="/admin" replace />;

  function resetForm() {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setView("list");
    setError(null);
  }

  function startCreate() {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setView("form");
    setError(null);
    setMessage(null);
  }

  function fillFromPost(post: BlogPost) {
    setMode("edit");
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status,
      fiverr_url: post.fiverr_url ?? "",
      upwork_url: post.upwork_url ?? "",
      featured_image_path: post.featured_image_path,
      meta_title: post.meta_title ?? "",
      meta_description: post.meta_description ?? "",
      focus_keyword: post.focus_keyword ?? "",
      image_alt: post.image_alt ?? "",
    });
    setFile(null);
    setView("form");
    setError(null);
    setMessage(null);
  }

  async function uploadImage(selected: File) {
    const ext = selected.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("blog-images").upload(path, selected, {
      cacheControl: "3600",
      upsert: false,
      contentType: selected.type || "image/jpeg",
    });
    if (upErr) throw new Error(upErr.message);
    return path;
  }

  async function savePost(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    setMessage(null);

    const title = form.title.trim();
    const slug = (form.slug.trim() || slugify(title)).replace(/^-+|-+$/g, "");
    if (!title || !slug) {
      setError("Title is required");
      setBusy(false);
      return;
    }
    if (RESERVED_PATHS.has(slug)) {
      setError(`Slug “${slug}” is reserved. Choose another permalink.`);
      setBusy(false);
      return;
    }
    if (!form.content.trim()) {
      setError("Article content is required");
      setBusy(false);
      return;
    }

    try {
      let imagePath = form.featured_image_path;
      if (file) imagePath = await uploadImage(file);

      const publishing = form.status === "published";
      const payload = {
        title,
        slug,
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        status: form.status,
        fiverr_url: form.fiverr_url.trim() || null,
        upwork_url: form.upwork_url.trim() || null,
        featured_image_path: imagePath || null,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        focus_keyword: form.focus_keyword.trim() || null,
        image_alt: form.image_alt.trim() || null,
        updated_at: new Date().toISOString(),
        published_at: publishing ? new Date().toISOString() : null,
      };

      if (mode === "edit" && editingId) {
        const existing = posts.find((p) => p.id === editingId);
        // Renamed permalink: 301 old slug → new slug
        if (existing && existing.slug !== slug) {
          await supabase.from("blog_redirects").upsert({
            slug: existing.slug,
            target: `/${slug}`,
          });
        }
        const { error: err } = await supabase
          .from("blog_posts")
          .update({
            ...payload,
            published_at:
              publishing && existing?.published_at ? existing.published_at : payload.published_at,
          })
          .eq("id", editingId);
        if (err) throw new Error(err.message);
        setMessage("Post updated");
      } else {
        const { error: err } = await supabase.from("blog_posts").insert({
          ...payload,
          created_by: user.id,
        });
        if (err) throw new Error(err.message);
        setMessage("Post created");
      }

      // Live slug must not stay in the redirect table
      await supabase.from("blog_redirects").delete().eq("slug", slug);
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save post");
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(post: BlogPost) {
    if (!window.confirm(`Delete “${post.title}”? The URL /${post.slug} will 301 to /blog.`)) return;

    const { error: redirectErr } = await supabase.from("blog_redirects").upsert({
      slug: post.slug,
      target: "/blog",
    });
    if (redirectErr) {
      setError(redirectErr.message);
      return;
    }

    if (post.featured_image_path) {
      await supabase.storage.from("blog-images").remove([post.featured_image_path]);
    }
    const { error: delErr } = await supabase.from("blog_posts").delete().eq("id", post.id);
    if (delErr) {
      setError(delErr.message);
      return;
    }
    setMessage(`Deleted — /${post.slug} now 301 redirects to /blog`);
    await load();
  }

  if (view === "form") {
    const preview = blogImageUrl(form.featured_image_path);
    return (
      <div className="p-6 lg:p-10 max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-coral-500 mb-2">// blog</p>
            <h1 className="font-display text-3xl text-navy-900 font-semibold">
              {mode === "edit" ? "Edit post" : "New post"}
            </h1>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="font-display text-sm text-slate-500 hover:text-navy-900"
          >
            ← Back to list
          </button>
        </div>

        {error && <p className="font-mono text-xs text-coral-500">{error}</p>}
        {message && <p className="font-mono text-xs text-sky-500">{message}</p>}

        <form onSubmit={savePost} className="space-y-4 rounded-2xl border border-navy-900/10 bg-white p-6">
          <input
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({
                ...f,
                title,
                slug: mode === "create" ? slugify(title) : f.slug,
              }));
            }}
            placeholder="Post title"
            className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
          />
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            placeholder="url-slug"
            className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
          />
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            placeholder="Short excerpt for the blogs list"
            rows={2}
            className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
          />
          <textarea
            required
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder={"Article body (markdown-lite)\n\n## Heading\nParagraph…\n- List item\n> Quote"}
            rows={16}
            className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
          />
          <div className="rounded-xl border border-navy-900/10 bg-navy-900/[0.02] p-4 space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-slate-400">On-page SEO</p>
            <input
              value={form.meta_title}
              onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
              placeholder="Meta title (≤60 chars, defaults to post title)"
              maxLength={70}
              className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500 bg-white"
            />
            <textarea
              value={form.meta_description}
              onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
              placeholder="Meta description (140–160 chars)"
              maxLength={170}
              rows={2}
              className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500 bg-white"
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                value={form.focus_keyword}
                onChange={(e) => setForm((f) => ({ ...f, focus_keyword: e.target.value }))}
                placeholder="Focus keyword"
                className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500 bg-white"
              />
              <input
                value={form.image_alt}
                onChange={(e) => setForm((f) => ({ ...f, image_alt: e.target.value }))}
                placeholder="Featured image alt text"
                className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500 bg-white"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              value={form.fiverr_url}
              onChange={(e) => setForm((f) => ({ ...f, fiverr_url: e.target.value }))}
              placeholder="Fiverr gig URL (optional override)"
              className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
            />
            <input
              value={form.upwork_url}
              onChange={(e) => setForm((f) => ({ ...f, upwork_url: e.target.value }))}
              placeholder="Upwork profile URL (optional override)"
              className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                Featured image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm font-mono text-slate-500"
              />
            </label>
            {(preview || file) && (
              <img
                src={file ? URL.createObjectURL(file) : preview!}
                alt=""
                className="h-28 w-full object-cover rounded-xl border border-navy-900/10"
              />
            )}
          </div>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BlogPostStatus }))}
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm bg-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="bg-navy-900 text-white font-display text-sm px-6 py-3 rounded-full hover:bg-coral-500 disabled:opacity-50"
            >
              {busy ? "Saving…" : mode === "edit" ? "Update post" : "Create post"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="border border-navy-900/15 font-display text-sm px-6 py-3 rounded-full"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-coral-500 mb-2">// blog</p>
          <h1 className="font-display text-3xl text-navy-900 font-semibold">Blog posts</h1>
          <p className="text-sm text-slate-500 mt-2">
            Publish daily articles. Ad units in{" "}
            <Link to="/admin/blog-ads" className="text-coral-500 hover:underline">
              Blog ads
            </Link>
            . Auto-publish via{" "}
            <Link to="/admin/blog-ai" className="text-coral-500 hover:underline">
              AI Publisher
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="bg-navy-900 text-white font-display text-sm px-5 py-2.5 rounded-full hover:bg-coral-500"
        >
          New post
        </button>
      </div>

      {error && <p className="font-mono text-xs text-coral-500">{error}</p>}
      {message && <p className="font-mono text-xs text-sky-500">{message}</p>}

      <ul className="space-y-3">
        {posts.map((post) => (
          <li
            key={post.id}
            className="rounded-2xl border border-navy-900/10 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="font-display text-lg text-navy-900 truncate">{post.title}</p>
              <p className="font-mono text-xs text-slate-400 mt-1">
                /{post.slug} · {post.status}
                {post.ai_generated ? " · AI" : ""}
                {post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString()}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {post.status === "published" && (
                <a
                  href={`/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-navy-900/15 font-display text-sm px-4 py-2 rounded-full"
                >
                  View
                </a>
              )}
              <button
                type="button"
                onClick={() => fillFromPost(post)}
                className="border border-navy-900/15 font-display text-sm px-4 py-2 rounded-full hover:border-coral-500"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void deletePost(post)}
                className="border border-coral-500/40 text-coral-500 font-display text-sm px-4 py-2 rounded-full"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="text-sm text-slate-500 font-display">No posts yet. Create your first article.</li>
        )}
      </ul>
    </div>
  );
}
