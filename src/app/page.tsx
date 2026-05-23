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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">

        {/* Header */}
        <header className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30">
              Claude API
            </span>
            <span className="font-mono text-[10px] text-zinc-500">stripe-sme-demo</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Stripe SME — Domain Expert API Demo
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            A specialist agent that knows when to answer, when to ask, and when to escalate.
          </p>
        </header>

        {/* Example chips */}
        <div className="mb-5 space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Example questions
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleChip(q)}
                disabled={loading}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-violet-500/60 hover:bg-violet-500/10 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="relative mb-6">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="Ask a question about the Stripe Services Agreement…"
            className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50"
            disabled={loading}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-zinc-600">
              ⌘ + Enter to submit
            </span>
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !question.trim()}
              className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Asking…" : "Ask"}
            </button>
          </div>
        </div>

        {/* Divider */}
        {hasResult && (
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
              response
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
        )}

        {/* Response */}
        <ResponseCard response={response} error={error} loading={loading} />

        {/* Footer */}
        <footer className="mt-16 border-t border-zinc-800 pt-6">
          <p className="text-[11px] text-zinc-600">
            Answers are grounded solely in the curated Stripe Services Agreement excerpt.
            This is a developer demo — not legal advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
