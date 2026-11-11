import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExtractionReview } from "@/components/extraction-review";

const items = [
  { title: "Quiz 1", dueDate: "2026-10-05", notes: "" },
  { title: "Final", dueDate: "2026-12-10", notes: "" },
];

describe("ExtractionReview", () => {
  it("saves only the checked items", async () => {
    const onSave = vi.fn();
    render(<ExtractionReview items={items} onSave={onSave} />);
    await userEvent.click(screen.getByRole("checkbox", { name: /quiz 1/i }));
    await userEvent.click(screen.getByRole("button", { name: /save 1 assignment/i }));
    expect(onSave).toHaveBeenCalledWith([items[1]]);
  });

  it("shows an empty state when nothing was found", () => {
    render(<ExtractionReview items={[]} onSave={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent(/no dated assignments/i);
  });
});
