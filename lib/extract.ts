export type ExtractedAssignment = {
  title: string;
  dueDate: string; // YYYY-MM-DD
  notes: string;
};

export const EXTRACTION_PROMPT = `You extract graded work and deadlines from a university syllabus or course outline.
Return ONLY a JSON array. Each item: {"title": string, "dueDate": "YYYY-MM-DD", "notes": string}.
Rules: include only items with a specific due date. Resolve dates using the year in the text (if none, use the year given in "Reference date"). Never invent items or dates. If nothing is found, return [].`;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Validates untrusted model output. Throws if the shape is unusable. */
export function parseExtraction(raw: string): ExtractedAssignment[] {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error("The AI response was not valid JSON.");
  }
  if (!Array.isArray(data)) {
    throw new Error("The AI response was not a list.");
  }

  const seen = new Set<string>();
  const result: ExtractedAssignment[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const { title, dueDate, notes } = item as Record<string, unknown>;
    if (typeof title !== "string" || !title.trim()) continue;
    if (typeof dueDate !== "string" || !isRealDate(dueDate)) continue;
    const key = `${title.trim().toLowerCase()}|${dueDate}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      title: title.trim().slice(0, 120),
      dueDate,
      notes: typeof notes === "string" ? notes.trim().slice(0, 300) : "",
    });
  }
  return result;
}
