"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { addAssignment, getCourses } from "@/lib/storage";
import {
  ASSIGNMENT_STATUSES,
  formatStatus,
  type AssignmentStatus,
  type Course,
} from "@/lib/types";

type FormErrors = {
  title?: string;
  courseId?: string;
  dueDate?: string;
};

export default function NewAssignmentPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<AssignmentStatus>("todo");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const loaded = getCourses();
    setCourses(loaded);
    if (loaded.length === 1) {
      setCourseId(loaded[0].id);
    }
    setReady(true);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      nextErrors.title = "Title is required.";
    }
    if (!courseId) {
      nextErrors.courseId = "Select a course.";
    }
    if (!dueDate) {
      nextErrors.dueDate = "Due date is required.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    addAssignment({
      title: trimmedTitle,
      courseId,
      dueDate,
      status,
      notes: notes.trim(),
    });

    router.push("/assignments");
  }

  return (
    <section className="space-y-xl">
      <div className="space-y-sm">
        <h1 className="text-2xl font-semibold text-foreground">Add assignment</h1>
        <p className="text-muted">
          Create an assignment with a title, course, due date, status, and notes.
        </p>
      </div>

      {!ready ? (
        <p className="text-muted">Loading form…</p>
      ) : courses.length === 0 ? (
        <p className="rounded-md border border-border bg-surface p-md text-muted">
          Add a course before creating an assignment.{" "}
          <Link href="/courses" className="font-medium text-brand underline">
            Go to Courses
          </Link>
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-md rounded-md border border-border bg-surface p-md"
        >
          <div className="space-y-sm">
            <label htmlFor="assignment-title" className="block text-sm font-medium">
              Title
            </label>
            <input
              id="assignment-title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={
                errors.title ? "assignment-title-error" : undefined
              }
              className="w-full rounded-md border border-border bg-background px-md py-sm text-foreground"
            />
            {errors.title ? (
              <p
                id="assignment-title-error"
                className="text-sm text-danger"
                role="alert"
              >
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className="space-y-sm">
            <label
              htmlFor="assignment-course"
              className="block text-sm font-medium"
            >
              Course
            </label>
            <select
              id="assignment-course"
              name="courseId"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              aria-invalid={Boolean(errors.courseId)}
              aria-describedby={
                errors.courseId ? "assignment-course-error" : undefined
              }
              className="w-full rounded-md border border-border bg-background px-md py-sm text-foreground"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.name}
                </option>
              ))}
            </select>
            {errors.courseId ? (
              <p
                id="assignment-course-error"
                className="text-sm text-danger"
                role="alert"
              >
                {errors.courseId}
              </p>
            ) : null}
          </div>

          <div className="grid gap-md md:grid-cols-2">
            <div className="space-y-sm">
              <label
                htmlFor="assignment-due-date"
                className="block text-sm font-medium"
              >
                Due date
              </label>
              <input
                id="assignment-due-date"
                name="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                aria-invalid={Boolean(errors.dueDate)}
                aria-describedby={
                  errors.dueDate ? "assignment-due-date-error" : undefined
                }
                className="w-full rounded-md border border-border bg-background px-md py-sm text-foreground"
              />
              {errors.dueDate ? (
                <p
                  id="assignment-due-date-error"
                  className="text-sm text-danger"
                  role="alert"
                >
                  {errors.dueDate}
                </p>
              ) : null}
            </div>

            <div className="space-y-sm">
              <label
                htmlFor="assignment-status"
                className="block text-sm font-medium"
              >
                Status
              </label>
              <select
                id="assignment-status"
                name="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as AssignmentStatus)
                }
                className="w-full rounded-md border border-border bg-background px-md py-sm text-foreground"
              >
                {ASSIGNMENT_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {formatStatus(value)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-sm">
            <label htmlFor="assignment-notes" className="block text-sm font-medium">
              Notes
            </label>
            <textarea
              id="assignment-notes"
              name="notes"
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-md py-sm text-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-md">
            <button
              type="submit"
              className="rounded-md bg-brand px-md py-sm text-sm font-medium text-brand-foreground"
            >
              Save assignment
            </button>
            <Link
              href="/assignments"
              className="rounded-md border border-border px-md py-sm text-sm font-medium text-foreground"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}
