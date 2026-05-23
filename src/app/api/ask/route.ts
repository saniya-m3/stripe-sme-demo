import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a Stripe Subject Matter Expert. You answer engineering questions strictly using the Stripe Services Agreement excerpt provided below.

Classify every question into exactly ONE mode:

RESOLVE — the Agreement clearly and fully answers it. Give the answer and quote the specific clause it rests on.

CLARIFY — the answer depends on user-specific context that is missing. Ask ONE specific, targeted follow-up question (never a vague "tell me more"). State why you are asking and how the answer changes depending on it.

ESCALATE — the Agreement does not contain the answer, OR answering requires reconciling conflicting rules or business judgment. Do not guess. Explain why it cannot be answered from the document and give 2–3 handling strategies.

The cardinal rule: never give a confident answer to a CLARIFY or ESCALATE question. Abstaining is correct behavior, not failure.

Respond ONLY with JSON, no other text:
{
  "mode": "RESOLVE" | "CLARIFY" | "ESCALATE",
  "answer": "the answer, question, or escalation explanation",
  "citation": "exact clause text, or empty string",
  "strategies": ["strategy 1", "strategy 2"] or []
}

--- STRIPE SERVICES AGREEMENT EXCERPT ---
STRIPE SERVICES AGREEMENT — CURATED EXCERPT
Sourced from the General Terms (Nov 18, 2025) and the Stripe Payments Terms (Apr 24, 2026), stripe.com/legal/ssa.

=== A. FEES, REFUNDS, DISPUTES ===
[General Terms 7.1(a)] The Fees are as listed on the Stripe Pricing Page, unless User and Stripe otherwise agree in writing. Unless User and Stripe otherwise agree in writing or if Law requires, payment obligations are non-cancelable and Fees paid are non-refundable.
[Payments Terms 5.2] Notwithstanding anything to the contrary in this Agreement, User is liable to Stripe for the full amount of all Disputes (unless and until a Dispute is resolved to final disposition in User's favor according to applicable Payment Method Rules) and other related costs, Refunds and Reversals regardless of the reason, timing or whether User uses the Stripe Payments Services to manage its Disputes, Refunds or Reversals.
[Payments Terms 5.2(a)(i)] Stripe may delay or withhold paying out a Transaction amount from funds owed to User if Stripe reasonably believes that a Dispute is likely to occur. Stripe may delay or withhold paying out amounts subject to an actual Dispute until the Payment Method Provider resolves the Dispute.
[Payments Terms 4.3] Stripe will transfer settlement funds for Transactions, net of Fees, Disputes, Refunds, Reversals and other amounts owed to Stripe, from the applicable Pooled Account to User in accordance with the applicable settlement method.
[Payments Terms 14] "Refund" means an instruction User initiates to provide a full or partial return of funds to a Customer for a processed Transaction.

=== B. SETTLEMENT HOLDS, RESERVES, REMEDIES ===
[Payments Terms 5.3] Stripe may exercise any or all of the remedies stated in Section 5.5 if Stripe reasonably determines that a User Entity: (a) has incurred or is likely to incur excessive Disputes, Refunds or Reversals; ... (k) has initiated Transactions or undertaken any other action that is or is likely to be fraudulent, suspicious or involve criminal activity; ... (m) has acted in a manner or engaged in business, trading practice or other activity that presents an unacceptable risk.
[Payments Terms 5.5] If a triggering event in Section 5.3 or 5.4 has occurred, then Stripe may: (a) initiate Reversals; (b) change the Payout Schedule or delay or cancel the payout of funds; (c) establish, fund, use, and apply a Reserve; (d) suspend or terminate User's ability to accept or process Transactions; (f) refuse to process Transactions and act upon Refund instructions.
[Payments Terms 4.1(b)] Stripe may refuse to process, or condition or suspend any Transaction that Stripe believes (x) may violate this Agreement; (y) is unauthorized, fraudulent or illegal; or (z) exposes, or is likely to expose, Stripe, User or others to unacceptable risk.
[Financial Services Terms 3.3(a)] Where permitted in the Service Terms, Stripe may establish a Reserve and will notify User of the Reserve terms. Stripe will release to User any funds forming part of the Reserve only if, and to the extent that, Stripe is satisfied that the relevant risk exposure has been mitigated.

=== C. PAYOUTS AND PAYOUT SCHEDULE ===
[Payments Terms 14] "Payout Schedule" means the schedule that User selects in the Stripe Dashboard (e.g. daily, weekly, monthly) to pay out Transaction settlement funds to a User Bank Account after those funds become available based on the Payout Speed.
[Payments Terms 4.3(a)] Where Stripe settles funds to a User Bank Account, Stripe will do so in accordance with the Payout Schedule. However, Stripe may impose an additional holding period before making the initial settlement to a User Bank Account.

=== D. PLATFORMS / COLLECTING PAYMENTS FOR THIRD PARTIES ===
[General Terms 1.2(a)(viii)] User must not act as service bureau or pass-through agent for the Services with no added value to Customers.
[Payments Terms 3.4(b)] User must not act as or hold itself out as a payment facilitator, intermediary or aggregator, or otherwise resell the Stripe Payments Services.
[Note: Stripe Connect is a separate Service with its own Service Terms. Enabling third parties to accept payments through a platform requires Stripe Connect; the standard Stripe Payments Services do not permit it.]`;

export interface AskResponse {
  mode: "RESOLVE" | "CLARIFY" | "ESCALATE";
  answer: string;
  citation: string;
  strategies: string[];
}

export interface AskErrorResponse {
  error: string;
  mode: "ERROR";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || !body.question || typeof body.question !== "string") {
    return NextResponse.json({ error: "question is required", mode: "ERROR" }, { status: 400 });
  }

  const { question } = body as { question: string };

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: question }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from model.", mode: "ERROR" },
        { status: 502 }
      );
    }

    let parsed: AskResponse;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return NextResponse.json(
        { error: "Model response was not valid JSON.", mode: "ERROR" },
        { status: 502 }
      );
    }

    if (!["RESOLVE", "CLARIFY", "ESCALATE"].includes(parsed.mode)) {
      return NextResponse.json(
        { error: "Unexpected mode in model response.", mode: "ERROR" },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid or missing API key.", mode: "ERROR" },
        { status: 401 }
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limit reached. Please try again shortly.", mode: "ERROR" },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `API error: ${err.message}`, mode: "ERROR" },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred.", mode: "ERROR" },
      { status: 500 }
    );
  }
}
