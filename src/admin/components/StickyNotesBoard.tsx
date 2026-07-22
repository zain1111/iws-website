import { useState } from "react";
import { supabase } from "../../lib/supabase";
import type { StickyNote } from "../../types/database";

const COLORS = ["#FF5A45", "#3B89CA", "#5CB0E5", "#1E496E", "#FF7A61"];

interface Props {
  notes: StickyNote[];
  userId: string;
  onChange: (notes: StickyNote[]) => void;
}

export default function StickyNotesBoard({ notes, userId, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function addNote() {
    if (!draft.trim()) return;
    setBusy(true);
    const color = COLORS[notes.length % COLORS.length];
    const { data, error } = await supabase
      .from("sticky_notes")
      .insert({
        user_id: userId,
        content: draft.trim(),
        color,
        sort_order: notes.length,
      })
      .select()
      .single();
    setBusy(false);
    if (!error && data) {
      onChange([...notes, data as StickyNote]);
      setDraft("");
    }
  }

  async function updateNote(id: string, content: string) {
    onChange(notes.map((n) => (n.id === id ? { ...n, content } : n)));
    await supabase.from("sticky_notes").update({ content, updated_at: new Date().toISOString() }).eq("id", id);
  }

  async function removeNote(id: string) {
    onChange(notes.filter((n) => n.id !== id));
    await supabase.from("sticky_notes").delete().eq("id", id);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void addNote()}
          placeholder="Jot a pending thought…"
          className="flex-1 rounded-xl border border-navy-900/15 bg-white px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
        />
        <button
          onClick={() => void addNote()}
          disabled={busy}
          className="shrink-0 bg-coral-500 text-white font-display text-sm px-5 py-3 rounded-full hover:bg-coral-400 disabled:opacity-60"
        >
          Add note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-900/15 p-10 text-center text-slate-400 text-sm">
          Your board is empty — add sticky notes for pending tasks and reminders.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => (
            <article
              key={note.id}
              className="relative rounded-xl p-4 min-h-[140px] shadow-sm"
              style={{ backgroundColor: `${note.color}22`, borderTop: `4px solid ${note.color}` }}
            >
              <textarea
                value={note.content}
                onChange={(e) => void updateNote(note.id, e.target.value)}
                className="w-full h-24 resize-none bg-transparent font-display text-sm text-navy-900 outline-none"
              />
              <button
                onClick={() => void removeNote(note.id)}
                className="absolute top-2 right-3 font-mono text-xs text-slate-400 hover:text-coral-500"
                aria-label="Delete note"
              >
                ×
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
