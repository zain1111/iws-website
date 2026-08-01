import { runBlogAiPipeline } from "./lib/blogAiPipeline.mjs";

/** Daily ~06:00 UTC — publishes up to 3 SEO'd articles (AI topic guaranteed). */
export default async () => {
  try {
    const result = await runBlogAiPipeline({ trigger: "schedule", count: 3 });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Scheduled publish failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

export const config = {
  schedule: "0 6 * * *",
};
