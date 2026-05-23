"use client";

import type { AskResponse } from "@/app/api/ask/route";

interface ResponseCardProps {
  response: (AskResponse & { mode: "RESOLVE" | "CLARIFY" | "ESCALATE" }) | null;
  error: string | null;
  loading: boolean;
}

const modeConfig = {
  RESOLVE: {
    badge: "RESOLVE",
    badgeClass: "bg-green-500/15 text-green-400 ring-1 ring-green-500/30",
    borderClass: "border-green-500/40",
    accentClass: "text-green-400",
    label: "Answer",
  },
  CLARIFY: {
    badge: "CLARIFY",
    badgeClass: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    borderClass: "border-amber-500/40",
    accentClass: "text-amber-400",
    label: "Follow-up needed",
  },
  ESCALATE: {
    badge: "ESCALATE",
    badgeClass: "bg-red-500/15 text-red-400 ring-1 ring-red-500/30",
    borderClass: "border-red-500/40",
    accentClass: "text-red-400",
    label: "Needs human judgment",
  },
} as const;

function LoadingSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-5 w-20 rounded-full bg-zinc-800" />
        <div className="h-4 w-32 rounded bg-zinc-800" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-zinc-800" />
        <div className="h-4 w-5/6 rounded bg-zinc-800" />
        <div className="h-4 w-4/6 rounded bg-zinc-800" />
      </div>
    </div>
  );
}

export default function ResponseCard({ response, error, loading }: ResponseCardProps) {
  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-zinc-900 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-mono font-semibold bg-red-500/15 text-red-400 ring-1 ring-red-500/30">
            ERROR
          </span>
        </div>
        <p className="text-sm text-zinc-300">{error}</p>
      </div>
    );
  }

  if (!response) return null;

  const config = modeConfig[response.mode];

  return (
    <div className={`rounded-lg border ${config.borderClass} bg-zinc-900 p-6 space-y-5`}>
      {/* Badge */}
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-semibold ${config.badgeClass}`}>
          {config.badge}
        </span>
        <span className={`text-xs font-medium ${config.accentClass}`}>{config.label}</span>
      </div>

      {/* RESOLVE */}
      {response.mode === "RESOLVE" && (
        <>
          <p className="text-sm leading-relaxed text-zinc-200">{response.answer}</p>
          {response.citation && (
            <div className="rounded-md border border-zinc-700 bg-zinc-950 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-green-400">
                Source clause
              </p>
              <p className="font-mono text-xs leading-relaxed text-zinc-400">
                {response.citation}
              </p>
            </div>
          )}
        </>
      )}

      {/* CLARIFY */}
      {response.mode === "CLARIFY" && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-zinc-200">{response.answer}</p>
          {response.citation && (
            <div className="flex gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
              <span className="mt-0.5 shrink-0 text-amber-400">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                </svg>
              </span>
              <p className="text-xs leading-relaxed text-amber-300/80">
                <span className="font-semibold text-amber-400">Why I&apos;m asking: </span>
                {response.citation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ESCALATE */}
      {response.mode === "ESCALATE" && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-zinc-200">{response.answer}</p>
          {response.strategies && response.strategies.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
                Suggested strategies
              </p>
              <ul className="space-y-2">
                {response.strategies.map((s, i) => (
                  <li key={i} className="flex gap-3 rounded-md bg-zinc-800/60 px-3 py-2.5">
                    <span className="shrink-0 font-mono text-xs font-bold text-red-400/70 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs leading-relaxed text-zinc-300">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
