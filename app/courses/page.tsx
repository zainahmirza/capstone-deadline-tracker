"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  addCourse,
  deleteCourse,
  getCourses,
} from "@/lib/storage";
import type { Course } from "@/lib/types";

type CourseFormErrors = {
  name?: string;
  code?: string;
};

const DEFAULT_COLOR = "#0f6b5c";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [errors, setErrors] = useState<CourseFormErrors>({});

  useEffect(() => {
    setCourses(getCourses());
    setReady(true);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: CourseFormErrors = {};
    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    if (!trimmedName) {
      nextErrors.name = "Course name is required.";
    }
    if (!trimmedCode) {
      nextErrors.code = "Course code is required.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    addCourse({
      name: trimmedName,
      code: trimmedCode,
      color,
    });
    setCourses(getCourses());
    setName("");
    setCode("");
    setColor(DEFAULT_COLOR);
    setErrors({});
  }

  function handleDelete(courseId: string) {
    deleteCourse(courseId);
    setCourses(getCourses());
  }

  return (
    <section className="space-y-xl">
      <div className="space-y-sm">
        <h1 className="text-2xl font-semibold text-foreground">Courses</h1>
        <p className="text-muted">
          List your courses and add a new one with a name, code, and color.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-md rounded-md border border-border bg-surface p-md"
      >
        <h2 className="text-lg font-semibold text-foreground">Add course</h2>

        <div className="grid gap-md md:grid-cols-3">
          <div className="space-y-sm">
            <label htmlFor="course-name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="course-name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "course-name-error" : undefined}
              className="w-full rounded-md border border-border bg-background px-md py-sm text-foreground"
            />
            {errors.name ? (
              <p id="course-name-error" className="text-sm text-danger" role="alert">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="space-y-sm">
            <label htmlFor="course-code" className="block text-sm font-medium">
              Code
            </label>
            <input
              id="course-code"
              name="code"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              aria-invalid={Boolean(errors.code)}
              aria-describedby={errors.code ? "course-code-error" : undefined}
              className="w-full rounded-md border border-border bg-background px-md py-sm text-foreground"
            />
            {errors.code ? (
              <p id="course-code-error" className="text-sm text-danger" role="alert">
                {errors.code}
              </p>
            ) : null}
          </div>

          <div className="space-y-sm">
            <label htmlFor="course-color" className="block text-sm font-medium">
              Color
            </label>
            <input
              id="course-color"
              name="color"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-10 w-full cursor-pointer rounded-md border border-border bg-background px-sm py-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-brand px-md py-sm text-sm font-medium text-brand-foreground"
        >
          Add course
        </button>
      </form>

      <div className="space-y-md">
        <h2 className="text-lg font-semibold text-foreground">Your courses</h2>

        {!ready ? (
          <p className="text-muted">Loading courses…</p>
        ) : courses.length === 0 ? (
          <p className="text-muted">No courses yet. Add your first course above.</p>
        ) : (
          <ul className="space-y-sm">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex flex-wrap items-center justify-between gap-md rounded-md border border-border bg-surface px-md py-md"
              >
                <div className="flex min-w-0 items-center gap-md">
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: course.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {course.name}
                    </p>
                    <p className="text-sm text-muted">{course.code}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(course.id)}
                  className="rounded-md border border-danger px-md py-sm text-sm font-medium text-danger"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
