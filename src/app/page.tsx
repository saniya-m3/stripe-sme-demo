"use client";

import { useState } from "react";
import ResponseCard from "@/app/components/ResponseCard";
import type { AskResponse } from "@/app/api/ask/route";

const EXAMPLE_QUESTIONS = [
  "We refunded a transaction, do we still owe Stripe their fee?",
  "A customer says their payment was unauthorized. Can Stripe freeze our settlements?",
  "We want to let our users collect payments via our platform. Is that allowed?",
  "Should we switch to daily payouts?",
];

type AppResponse = AskResponse & { mode: "RESOLVE" | "CLARIFY" | "ESCALATE" };

export default function Home() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AppResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasResult = loading || response !== null || error !== null;

  async function handleSubmit(q?: string) {
    const text = (q ?? question).trim();
    if (!text || loading) return;

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      const data = await res.json();

      if (!res.ok || data.mode === "ERROR") {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResponse(data as AppResponse);
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleChip(q: string) {
    setQuestion(q);
    handleSubmit(q);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

        {/* Header */}
        <header className="mb-6 pb-6 border-b border-[#E5E3F5]">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest bg-[#C6BEEE]/25 text-[#4A3A9B] ring-1 ring-[#C6BEEE]/60">
              Claude API
            </span>
            <span className="font-mono text-[10px] text-[#9B96C4]">stripe-sme-demo</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1A1A1A]">
            Stripe SME — Domain Expert API Demo
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">
            A specialist agent that knows when to answer, when to ask, and when to escalate.
          </p>
        </header>

        {/* Example chips */}
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-[#9B96C4]">
            Example questions
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleChip(q)}
                disabled={loading}
                className="rounded-full border border-[#E5E3F5] bg-white px-3 py-1.5 text-xs text-[#3A3A3A] transition-colors hover:border-[#C6BEEE] hover:bg-[#C6BEEE]/10 hover:text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="relative mb-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Ask a question about the Stripe Services Agreement…"
            className="w-full resize-none rounded-lg border border-[#E5E3F5] bg-white px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#C5C3CE] outline-none transition-colors focus:border-[#C6BEEE] focus:ring-1 focus:ring-[#C6BEEE]/30 disabled:opacity-50"
            disabled={loading}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-[#9B96C4]">
              ⌘ + Enter to submit
            </span>
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !question.trim()}
              className="rounded-md bg-[#C6BEEE] px-4 py-2 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#B5ACEC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Asking…" : "Ask"}
            </button>
          </div>
        </div>

        {/* Divider */}
        {hasResult && (
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E5E3F5]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B0ADB8]">
              response
            </span>
            <div className="h-px flex-1 bg-[#E5E3F5]" />
          </div>
        )}

        {/* Response */}
        <ResponseCard response={response} error={error} loading={loading} />

        {/* Footer */}
        <footer className="mt-8 border-t border-[#E5E3F5] pt-5">
          <p className="text-[11px] text-[#9B96C4]">
            Answers are grounded solely in the curated Stripe Services Agreement excerpt.
            This is a developer demo — not legal advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
