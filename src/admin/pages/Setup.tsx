import { Link } from "react-router-dom";

export default function AdminSetup() {
  return (
    <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full bg-paper text-navy-900 rounded-2xl p-8">
        <p className="font-mono text-xs text-coral-500 mb-3">// setup required</p>
        <h1 className="font-display text-3xl font-semibold mb-4">Connect Supabase</h1>
        <ol className="space-y-3 text-sm text-slate-600 list-decimal pl-5 leading-relaxed">
          <li>
            Create a project at{" "}
            <a className="text-coral-500 underline" href="https://supabase.com" target="_blank" rel="noreferrer">
              supabase.com
            </a>
            , then open <strong>Project Settings → API</strong>.
          </li>
          <li>
            Set <code className="font-mono text-xs bg-navy-900/5 px-1 rounded">VITE_SUPABASE_URL</code> and{" "}
            <code className="font-mono text-xs bg-navy-900/5 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Local:</strong> copy into a <code className="font-mono text-xs">.env</code> file (see{" "}
                <code className="font-mono text-xs">.env.example</code>), then restart{" "}
                <code className="font-mono text-xs">npm run dev</code>.
              </li>
              <li>
                <strong>Netlify:</strong> Site configuration → Environment variables → add both keys →{" "}
                <strong>Trigger deploy → Clear cache and deploy site</strong> (Vite needs a rebuild to pick them up).
              </li>
            </ul>
          </li>
          <li>
            In Supabase SQL Editor, run the full script in{" "}
            <code className="font-mono text-xs">supabase/schema.sql</code>.
          </li>
          <li>
            Sign up with <code className="font-mono text-xs">zain@theiwsolutions.com</code> — that account becomes
            super admin automatically.
          </li>
          <li>
            Supabase → Authentication → URL Configuration: set <strong>Site URL</strong> to your Netlify URL (and
            keep <code className="font-mono text-xs">http://localhost:5173</code> for local). Add Redirect URLs for{" "}
            <code className="font-mono text-xs">https://YOUR-SITE.netlify.app/admin/login</code> and{" "}
            <code className="font-mono text-xs">http://localhost:5173/admin/login</code>.
          </li>
          <li>
            For local testing only: Authentication → Providers → Email → turn{" "}
            <strong>Confirm email</strong> OFF if you hit expired-link errors.
          </li>
        </ol>
        <div className="mt-8 flex gap-4">
          <Link to="/admin/login" className="font-display text-sm bg-navy-900 text-white px-5 py-2.5 rounded-full">
            Try login again
          </Link>
          <a href="/" className="font-display text-sm text-slate-500 py-2.5">
            Website →
          </a>
        </div>
      </div>
    </div>
  );
}
