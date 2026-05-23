import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  // TODO: call Claude API with Stripe SME system prompt
  return NextResponse.json({ answer: "Not yet implemented" }, { status: 200 });
}
