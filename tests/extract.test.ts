import { describe, expect, it } from "vitest";
import { parseExtraction } from "@/lib/extract";

describe("parseExtraction", () => {
  it("parses a valid array and strips code fences", () => {
    const raw = '```json\n[{"title":"Quiz 1","dueDate":"2026-10-05","notes":"ch1"}]\n```';
    expect(parseExtraction(raw)).toEqual([
      { title: "Quiz 1", dueDate: "2026-10-05", notes: "ch1" },
    ]);
  });

  it("drops invalid dates, empty titles and duplicates", () => {
    const raw = JSON.stringify([
      { title: "A", dueDate: "2026-02-30" },
      { title: "", dueDate: "2026-10-05" },
      { title: "B", dueDate: "Oct 5" },
      { title: "C", dueDate: "2026-10-05" },
      { title: "c", dueDate: "2026-10-05" },
    ]);
    expect(parseExtraction(raw)).toHaveLength(1);
  });

  it("throws on non-JSON or non-array output", () => {
    expect(() => parseExtraction("sorry, I can't")).toThrow();
    expect(() => parseExtraction('{"a":1}')).toThrow();
  });
});
