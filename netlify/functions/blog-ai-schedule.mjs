import { runScheduledBlogAiIfDue } from "./lib/blogAiPipeline.mjs";

/**
 * Runs hourly. Publishes only when admin schedule_hour_utc matches current UTC hour
 * and a scheduled run has not already completed today.
 */
export default async () => {
  try {
    const result = await runScheduledBlogAiIfDue();
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
  schedule: "0 * * * *",
};
