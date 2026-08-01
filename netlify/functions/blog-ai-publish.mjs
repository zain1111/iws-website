import { assertAuthorized, runBlogAiPipeline } from "./lib/blogAiPipeline.mjs";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = await assertAuthorized(req);
    let count;
    let aiTopicCount;
    try {
      const body = await req.json();
      if (body?.count != null) count = Number(body.count);
      if (body?.aiTopicCount != null) aiTopicCount = Number(body.aiTopicCount);
    } catch {
      /* no body — pipeline uses saved admin settings */
    }

    const result = await runBlogAiPipeline({
      trigger: auth.mode === "cron" ? "schedule" : "manual",
      count,
      aiTopicCount,
      createdBy: auth.userId,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Publish failed";
    const status = message === "Unauthorized" || message === "Admin only" || message === "Invalid session" ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
};
