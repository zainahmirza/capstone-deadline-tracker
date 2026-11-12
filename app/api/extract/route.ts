import { NextResponse } from "next/server";
import { EXTRACTION_PROMPT, parseExtraction } from "@/lib/extract";

export const maxDuration = 60;

const MAX_CHARS = 15000;
const MODELS = [
  process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
];
const SYSTEM = `${EXTRACTION_PROMPT}\nWrap the array in a JSON object: {"assignments": [...]}.`;

async function callGroq(model: string, apiKey: string, text: string) {
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Reference date: ${new Date().toISOString().slice(0, 10)}\n\nSyllabus:\n${text}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(25000),
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI extraction is not configured. Add assignments manually." },
      { status: 503 },
    );
  }

  let text = "";
  try {
    const body = (await request.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "Paste some text first." }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `Text is too long (max ${MAX_CHARS} characters).` },
      { status: 413 },
    );
  }

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await callGroq(model, apiKey, text);
        if (res.ok) {
          const data = await res.json();
          const raw: string = data?.choices?.[0]?.message?.content ?? "";
          try {
            const parsed = JSON.parse(raw);
            const list = Array.isArray(parsed) ? parsed : parsed?.assignments;
            return NextResponse.json({
              assignments: parseExtraction(JSON.stringify(list ?? null)),
            });
          } catch (err) {
            const msg =
              err instanceof Error && err.message.startsWith("The AI response")
                ? err.message
                : "The AI response was not valid JSON.";
            return NextResponse.json(
              { error: `${msg} Add assignments manually.` },
              { status: 502 },
            );
          }
        }
        console.error("Groq error", model, res.status, await res.text());
        if (res.status !== 503 && res.status !== 429) break;
        await new Promise((r) => setTimeout(r, 1500));
      } catch (err) {
        console.error("Extract failed:", model, err);
        break;
      }
    }
  }

  return NextResponse.json(
    { error: "The AI service is busy right now. Try again in a minute, or add assignments manually." },
    { status: 502 },
  );
}