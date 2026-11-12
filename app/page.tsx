"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAssignments, getCourses } from "@/lib/storage";
import {
  ASSIGNMENT_STATUSES,
  formatStatus,
  type Assignment,
  type Course,
} from "@/lib/types";

function toDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDueDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AssignmentRow({
  assignment,
  course,
}: {
  assignment: Assignment;
  course?: Course;
}) {
  return (
    <li className="rounded-md border border-border bg-surface px-md py-md">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="min-w-0 space-y-xs">
          <p className="font-medium text-foreground">{assignment.title}</p>
          <p className="text-sm text-muted">
            {course ? `${course.code} — ${course.name}` : "Unknown course"}
          </p>
        </div>
        <div className="space-y-xs text-sm text-muted">
          <p>
            Due{" "}
            <span className="font-medium text-foreground">
              {formatDueDate(assignment.dueDate)}
            </span>
          </p>
          <p>{formatStatus(assignment.status)}</p>
        </div>
      </div>
    </li>
  );
}

export default function DashboardPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAssignments(getAssignments());
    setCourses(getCourses());
    setNow(new Date());
    setReady(true);
  }, []);

  const courseById = useMemo(() => {
    return new Map(courses.map((course) => [course.id, course]));
  }, [courses]);

  const { dueSoon, overdue, statusCounts } = useMemo(() => {
    const base = now ?? new Date(0);
    const today = toDateOnly(base);
    const weekAhead = toDateOnly(addDays(base, 7));

    const incomplete = assignments.filter(
      (assignment) => assignment.status !== "done",
    );

    const dueSoonItems = incomplete
      .filter(
        (assignment) =>
          assignment.dueDate >= today && assignment.dueDate <= weekAhead,
      )
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const overdueItems = incomplete
      .filter((assignment) => assignment.dueDate < today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const counts = {
      todo: 0,
      "in-progress": 0,
      done: 0,
    };

    for (const assignment of assignments) {
      counts[assignment.status] += 1;
    }

    return {
      dueSoon: dueSoonItems,
      overdue: overdueItems,
      statusCounts: counts,
    };
  }, [assignments, now]);

  return (
    <section className="space-y-xl">
      <div className="space-y-sm">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted">
          What&apos;s due in the next 7 days, overdue items, and counts by
          status.
        </p>
      </div>

      {!ready ? (
        <p className="text-muted">Loading dashboard…</p>
      ) : (
        <>
          <div className="grid gap-md sm:grid-cols-3">
            {ASSIGNMENT_STATUSES.map((status) => (
              <div
                key={status}
                className="rounded-md border border-border bg-surface p-md"
              >
                <p className="text-sm text-muted">{formatStatus(status)}</p>
                <p className="text-2xl font-semibold text-foreground">
                  {statusCounts[status]}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-md">
            <div className="flex flex-wrap items-end justify-between gap-md">
              <h2 className="text-lg font-semibold text-foreground">
                Due in the next 7 days
              </h2>
              <Link
                href="/assignments/new"
                className="text-sm font-medium text-brand underline"
              >
                Add assignment
              </Link>
            </div>
            {dueSoon.length === 0 ? (
              <p className="text-muted">Nothing due in the next 7 days.</p>
            ) : (
              <ul className="space-y-sm">
                {dueSoon.map((assignment) => (
                  <AssignmentRow
                    key={assignment.id}
                    assignment={assignment}
                    course={courseById.get(assignment.courseId)}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-md">
            <h2 className="text-lg font-semibold text-foreground">Overdue</h2>
            {overdue.length === 0 ? (
              <p className="text-muted">No overdue assignments.</p>
            ) : (
              <ul className="space-y-sm">
                {overdue.map((assignment) => (
                  <AssignmentRow
                    key={assignment.id}
                    assignment={assignment}
                    course={courseById.get(assignment.courseId)}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}