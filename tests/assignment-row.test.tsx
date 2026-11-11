import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AssignmentRow } from "@/components/assignment-row";

const assignment = {
  id: "a1",
  title: "Project proposal",
  courseId: "c1",
  dueDate: "2026-11-20",
  status: "todo" as const,
  notes: "",
};
const course = { id: "c1", name: "Software Engineering", code: "CS-301", color: "#000" };

describe("AssignmentRow", () => {
  it("shows title, course and due date", () => {
    render(<ul><AssignmentRow assignment={assignment} course={course} onStatusChange={vi.fn()} onDelete={vi.fn()} /></ul>);
    expect(screen.getByText("Project proposal")).toBeInTheDocument();
    expect(screen.getByText(/CS-301/)).toBeInTheDocument();
    expect(screen.getByText(/2026-11-20/)).toBeInTheDocument();
  });

  it("calls handlers for status change and delete", async () => {
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    render(<ul><AssignmentRow assignment={assignment} course={course} onStatusChange={onStatusChange} onDelete={onDelete} /></ul>);
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "done" } });
    expect(onStatusChange).toHaveBeenCalledWith("a1", "done");
    await userEvent.click(screen.getByRole("button", { name: /delete project proposal/i }));
    expect(onDelete).toHaveBeenCalledWith("a1");
  });
});
