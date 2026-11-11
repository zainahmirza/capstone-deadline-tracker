export type AssignmentStatus = "todo" | "in-progress" | "done";

export type Course = {
  id: string;
  name: string;
  code: string;
  color: string;
};

export type Assignment = {
  id: string;
  title: string;
  courseId: string;
  dueDate: string;
  status: AssignmentStatus;
  notes: string;
};

export const ASSIGNMENT_STATUSES: AssignmentStatus[] = [
  "todo",
  "in-progress",
  "done",
];

export function formatStatus(status: AssignmentStatus): string {
  switch (status) {
    case "todo":
      return "To do";
    case "in-progress":
      return "In progress";
    case "done":
      return "Done";
  }
}
