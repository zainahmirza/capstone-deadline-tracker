import { NextResponse } from "next/server";
import { EXTRACTION_PROMPT, parseExtraction } from "@/lib/extract";

const MAX_CHARS = 15000;
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
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

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: EXTRACTION_PROMPT }] },
          contents: [
            {
              parts: [
                {
                  text: `Reference date: ${new Date().toISOString().slice(0, 10)}\n\nSyllabus:\n${text}`,
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json"},
        }),
        signal: AbortSignal.timeout(25000),
      },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "The AI service is unavailable right now. Add assignments manually." },
        { status: 502 },
      );
    }
    const data = await res.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return NextResponse.json({ assignments: parseExtraction(raw) });
  } catch (err) {
    const message =
      err instanceof Error && err.message.startsWith("The AI response")
        ? err.message
        : "Could not reach the AI service.";
    return NextResponse.json(
      { error: `${message} Add assignments manually.` },
      { status: 502 },
    );
  }
}
