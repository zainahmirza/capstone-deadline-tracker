import {
  ASSIGNMENT_STATUSES,
  formatStatus,
  type Assignment,
  type AssignmentStatus,
  type Course,
} from "@/lib/types";

type Props = {
  assignment: Assignment;
  course?: Course;
  onStatusChange: (id: string, status: AssignmentStatus) => void;
  onDelete: (id: string) => void;
};

export function AssignmentRow({ assignment, course, onStatusChange, onDelete }: Props) {
  const selectId = `status-${assignment.id}`;
  return (
    <li className="rounded-md border border-border bg-surface px-md py-md">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="min-w-0 space-y-xs">
          <p className="font-medium text-foreground">{assignment.title}</p>
          <p className="text-sm text-muted">
            {course ? `${course.code} — ${course.name}` : "Unknown course"}
          </p>
          <p className="text-sm text-muted">Due {assignment.dueDate}</p>
        </div>
        <div className="flex items-end gap-sm">
          <div>
            <label htmlFor={selectId} className="block text-sm text-muted">
              Status
            </label>
            <select
              id={selectId}
              value={assignment.status}
              onChange={(e) => onStatusChange(assignment.id, e.target.value as AssignmentStatus)}
              className="rounded-md border border-border bg-background px-sm py-sm text-sm text-foreground"
            >
              {ASSIGNMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {formatStatus(s)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => onDelete(assignment.id)}
            aria-label={`Delete ${assignment.title}`}
            className="rounded-md border border-danger px-md py-sm text-sm font-medium text-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
