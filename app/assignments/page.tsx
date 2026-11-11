"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AssignmentRow } from "@/components/assignment-row";
import {
  deleteAssignment,
  getAssignments,
  getCourses,
  updateAssignment,
} from "@/lib/storage";
import {
  ASSIGNMENT_STATUSES,
  formatStatus,
  type Assignment,
  type AssignmentStatus,
  type Course,
} from "@/lib/types";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [ready, setReady] = useState(false);
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setAssignments(getAssignments());
    setCourses(getCourses());
    setReady(true);
  }, []);

  const courseById = useMemo(() => {
    return new Map(courses.map((course) => [course.id, course]));
  }, [courses]);

  const filtered = useMemo(() => {
    return assignments
      .filter((assignment) => {
        if (courseFilter !== "all" && assignment.courseId !== courseFilter) {
          return false;
        }
        if (statusFilter !== "all" && assignment.status !== statusFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [assignments, courseFilter, statusFilter]);

  return (
    <section className="space-y-xl">
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div className="space-y-sm">
          <h1 className="text-2xl font-semibold text-foreground">Assignments</h1>
          <p className="text-muted">
            All assignments with course, due date, and status. Filter as needed.
          </p>
        </div>
        <div className="flex gap-sm">
          <Link
            href="/assignments/import"
            className="rounded-md border border-border px-md py-sm text-sm font-medium text-foreground"
          >
            Import from syllabus
          </Link>
          <Link
            href="/assignments/new"
            className="rounded-md bg-brand px-md py-sm text-sm font-medium text-brand-foreground"
          >
            Add assignment
          </Link>
        </div>
      </div>

      <div className="grid gap-md rounded-md border border-border bg-surface p-md md:grid-cols-2">
        <div className="space-y-sm">
          <label htmlFor="filter-course" className="block text-sm font-medium">
            Filter by course
          </label>
          <select
            id="filter-course"
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-md py-sm text-foreground"
          >
            <option value="all">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-sm">
          <label htmlFor="filter-status" className="block text-sm font-medium">
            Filter by status
          </label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-md py-sm text-foreground"
          >
            <option value="all">All statuses</option>
            {ASSIGNMENT_STATUSES.map((status: AssignmentStatus) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!ready ? (
        <p className="text-muted">Loading assignments…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">
          {assignments.length === 0
            ? "No assignments yet."
            : "No assignments match these filters."}
        </p>
      ) : (
        <ul className="space-y-sm">
          {filtered.map((assignment) => (
            <AssignmentRow
              key={assignment.id}
              assignment={assignment}
              course={courseById.get(assignment.courseId)}
              onStatusChange={(id, status) => {
                updateAssignment(id, { status });
                setAssignments(getAssignments());
              }}
              onDelete={(id) => {
                deleteAssignment(id);
                setAssignments(getAssignments());
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
