"use client";

import type { AskResponse } from "@/app/api/ask/route";

interface ResponseCardProps {
  response: AskResponse | null;
  error: string | null;
  loading: boolean;
}

const modeConfig = {
  RESOLVE: {
    badge: "RESOLVE",
    badgeClass: "bg-[#9EEB47]/20 text-[#2D5A0B] ring-1 ring-[#9EEB47]/50",
    borderClass: "border-[#9EEB47]/40",
    topBar: "bg-[#9EEB47]",
    accentClass: "text-[#2D5A0B]",
    label: "Answer found",
  },
  CLARIFY: {
    badge: "CLARIFY",
    badgeClass: "bg-[#BCCEFB]/40 text-[#1A3A7A] ring-1 ring-[#BCCEFB]/70",
    borderClass: "border-[#BCCEFB]/60",
    topBar: "bg-[#BCCEFB]",
    accentClass: "text-[#1A3A7A]",
    label: "More context needed",
  },
  ESCALATE: {
    badge: "ESCALATE",
    badgeClass: "bg-[#F59794]/20 text-[#7A1F1F] ring-1 ring-[#F59794]/40",
    borderClass: "border-[#F59794]/40",
    topBar: "bg-[#F59794]",
    accentClass: "text-[#7A1F1F]",
    label: "Human judgment required",
  },
} as const;

/** Strip markdown bold/italic so raw asterisks never render as literal text. */
function stripMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1");
}

function LoadingSkeleton() {
  return (
    <div className="rounded-lg border border-[#E5E3F5] bg-white p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6BEEE] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B5ACEC]" />
        </span>
        <span className="text-[11px] font-mono tracking-widest uppercase text-[#9B96C4]">
          Analyzing agreement…
        </span>
      </div>
      <div className="space-y-2 animate-pulse">
        <div className="h-3 w-full rounded bg-[#F0EEF9]" />
        <div className="h-3 w-11/12 rounded bg-[#F0EEF9]" />
        <div className="h-3 w-4/5 rounded bg-[#F0EEF9]" />
        <div className="h-3 w-2/3 rounded bg-[#F0EEF9]" />
      </div>
    </div>
  );
}

export default function ResponseCard({ response, error, loading }: ResponseCardProps) {
  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-[#F59794]/40 bg-white overflow-hidden">
        <div className="h-0.5 bg-[#F59794]" />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="rounded px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider bg-[#F59794]/20 text-[#7A1F1F] ring-1 ring-[#F59794]/40">
              ERROR
            </span>
          </div>
          <p className="text-sm text-[#3A3A3A]">{error}</p>
        </div>
      </div>
    );
  }

  if (!response) return null;

  const config = modeConfig[response.mode];

  return (
    <div className={`rounded-lg border ${config.borderClass} bg-white overflow-hidden`}>
      {/* Colored top accent bar */}
      <div className={`h-0.5 ${config.topBar}`} />

      <div className="p-5 space-y-4">
        {/* Badge row */}
        <div className="flex items-center gap-2.5">
          <span
            className={`rounded px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider ${config.badgeClass}`}
          >
            {config.badge}
          </span>
          <span className={`text-xs font-medium ${config.accentClass}`}>{config.label}</span>
        </div>

        {/* RESOLVE */}
        {response.mode === "RESOLVE" && (
          <>
            <p className="text-sm leading-relaxed text-[#1A1A1A]">{stripMd(response.answer)}</p>
            {response.citation && (
              <div className="rounded border border-[#9EEB47]/30 bg-[#F5FDE8] overflow-hidden">
                <div className="flex items-center gap-1.5 border-b border-[#9EEB47]/20 bg-[#EDFAC4]/60 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9EEB47]" />
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#2D5A0B]">
                    Source clause
                  </p>
                </div>
                <p className="font-mono text-xs leading-relaxed text-[#3A3A3A] px-3 py-3">
                  {stripMd(response.citation)}
                </p>
              </div>
            )}
          </>
        )}

        {/* CLARIFY */}
        {response.mode === "CLARIFY" && (
          <div className="space-y-4">
            {/* Summary */}
            <p className="text-sm leading-relaxed text-[#1A1A1A]">{stripMd(response.summary)}</p>

            {/* Questions — most prominent element */}
            {response.questions.length > 0 && (
              <ul className="space-y-2">
                {response.questions.map((q, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-lg border border-[#BCCEFB] bg-[#EEF4FF] px-4 py-3"
                  >
                    <span className="shrink-0 font-mono text-xs font-bold text-[#1A3A7A] mt-0.5 select-none">
                      {response.questions.length > 1 ? `${i + 1}.` : "→"}
                    </span>
                    <span className="text-sm font-medium text-[#1A1A1A] leading-snug">
                      {stripMd(q)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Reasoning — quieter */}
            {response.reasoning && (
              <div className="flex gap-2.5 rounded border border-[#BCCEFB]/40 bg-[#F5F8FF] px-3 py-2.5">
                <span className="mt-0.5 shrink-0 text-[#6B8AC4]">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                  </svg>
                </span>
                <p className="text-xs leading-relaxed text-[#4A4A4A]">
                  <span className="font-semibold text-[#1A3A7A]">Why I&apos;m asking: </span>
                  {stripMd(response.reasoning)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ESCALATE */}
        {response.mode === "ESCALATE" && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-[#1A1A1A]">{stripMd(response.answer)}</p>
            {response.strategies && response.strategies.length > 0 && (
              <div>
                <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#7A1F1F] mb-2">
                  Handling strategies
                </p>
                <ul className="space-y-1.5">
                  {response.strategies.map((s, i) => (
                    <li key={i} className="flex gap-3 rounded border border-[#F59794]/25 bg-[#FFF4F4] px-3 py-2.5">
                      <span className="shrink-0 font-mono text-[11px] font-bold text-[#C05050] mt-0.5">
                        {i + 1}.
                      </span>
                      <span className="text-xs leading-relaxed text-[#3A3A3A]">{stripMd(s)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
