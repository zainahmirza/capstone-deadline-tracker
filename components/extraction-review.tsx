"use client";

import { useState } from "react";
import type { ExtractedAssignment } from "@/lib/extract";

type Props = {
  items: ExtractedAssignment[];
  onSave: (items: ExtractedAssignment[]) => void;
};

export function ExtractionReview({ items, onSave }: Props) {
  const [selected, setSelected] = useState<boolean[]>(items.map(() => true));

  if (items.length === 0) {
    return (
      <p role="status" className="text-muted">
        No dated assignments were found. Try pasting more of the outline, or add them manually.
      </p>
    );
  }

  const chosen = items.filter((_, i) => selected[i]);

  return (
    <div className="space-y-md">
      <h2 className="text-lg font-semibold">Review extracted assignments</h2>
      <ul className="space-y-sm">
        {items.map((item, i) => (
          <li key={`${item.title}-${item.dueDate}`} className="rounded-md border border-border bg-surface p-md">
            <label className="flex items-start gap-md">
              <input
                type="checkbox"
                checked={selected[i]}
                onChange={() => setSelected((s) => s.map((v, j) => (j === i ? !v : v)))}
              />
              <span>
                <span className="block font-medium">{item.title}</span>
                <span className="block text-sm text-muted">Due {item.dueDate}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={chosen.length === 0}
        onClick={() => onSave(chosen)}
        className="rounded-md bg-brand px-md py-sm text-sm font-medium text-brand-foreground disabled:opacity-50"
      >
        Save {chosen.length} assignment{chosen.length === 1 ? "" : "s"}
      </button>
    </div>
  );
}
