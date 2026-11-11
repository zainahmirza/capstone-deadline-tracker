"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExtractionReview } from "@/components/extraction-review";
import type { ExtractedAssignment } from "@/lib/extract";
import { addAssignments, getCourses } from "@/lib/storage";
import type { Course } from "@/lib/types";

export default function ImportPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [ready, setReady] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<ExtractedAssignment[] | null>(null);

  useEffect(() => {
    setCourses(getCourses());
    setReady(true);
  }, []);

  async function handleExtract() {
    setError("");
    setItems(null);
    if (!courseId) return setError("Select a course first.");
    if (!text.trim()) return setError("Paste a syllabus or course outline first.");
    setLoading(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Extraction failed.");
      setItems(data.assignments);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed. Add assignments manually.");
    } finally {
      setLoading(false);
    }
  }

  function handleSave(chosen: ExtractedAssignment[]) {
    addAssignments(chosen.map((c) => ({ ...c, courseId, status: "todo" as const })));
    router.push("/assignments");
  }

  if (!ready) return <p className="text-muted">Loading…</p>;

  return (
    <section className="space-y-xl">
      <div className="space-y-sm">
        <h1 className="text-2xl font-semibold">Import from syllabus</h1>
        <p className="text-muted">
          Paste a syllabus. AI finds the assignments and due dates; you review before saving.
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="rounded-md border border-border bg-surface p-md text-muted">
          Add a course first.{" "}
          <Link href="/courses" className="font-medium text-brand underline">
            Go to Courses
          </Link>
        </p>
      ) : (
        <div className="space-y-md rounded-md border border-border bg-surface p-md">
          <div className="space-y-sm">
            <label htmlFor="import-course" className="block text-sm font-medium">
              Course
            </label>
            <select
              id="import-course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-md py-sm"
            >
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-sm">
            <label htmlFor="import-text" className="block text-sm font-medium">
              Syllabus text
            </label>
            <textarea
              id="import-text"
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-md py-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleExtract}
            disabled={loading}
            className="rounded-md bg-brand px-md py-sm text-sm font-medium text-brand-foreground disabled:opacity-50"
          >
            {loading ? "Extracting…" : "Extract assignments"}
          </button>
          {error ? (
            <p role="alert" className="rounded-md border border-danger p-md text-sm text-danger">
              {error}{" "}
              <Link href="/assignments/new" className="font-medium underline">
                Add manually
              </Link>
            </p>
          ) : null}
        </div>
      )}

      {items ? <ExtractionReview items={items} onSave={handleSave} /> : null}
    </section>
  );
}
