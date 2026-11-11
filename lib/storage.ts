import type { Assignment, Course } from "@/lib/types";

const COURSES_KEY = "deadline-tracker:courses";
const ASSIGNMENTS_KEY = "deadline-tracker:assignments";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCourses(): Course[] {
  return readJson<Course[]>(COURSES_KEY, []);
}

export function saveCourses(courses: Course[]): void {
  writeJson(COURSES_KEY, courses);
}

export function addCourse(course: Omit<Course, "id">): Course {
  const next: Course = {
    ...course,
    id: crypto.randomUUID(),
  };
  const courses = getCourses();
  saveCourses([...courses, next]);
  return next;
}

export function deleteCourse(courseId: string): void {
  const courses = getCourses().filter((course) => course.id !== courseId);
  saveCourses(courses);

  const assignments = getAssignments().filter(
    (assignment) => assignment.courseId !== courseId,
  );
  saveAssignments(assignments);
}

export function getAssignments(): Assignment[] {
  return readJson<Assignment[]>(ASSIGNMENTS_KEY, []);
}

export function saveAssignments(assignments: Assignment[]): void {
  writeJson(ASSIGNMENTS_KEY, assignments);
}

export function addAssignment(assignment: Omit<Assignment, "id">): Assignment {
  const next: Assignment = {
    ...assignment,
    id: crypto.randomUUID(),
  };
  const assignments = getAssignments();
  saveAssignments([...assignments, next]);
  return next;
}

export function updateAssignment(
  id: string,
  changes: Partial<Omit<Assignment, "id">>,
): void {
  saveAssignments(
    getAssignments().map((a) => (a.id === id ? { ...a, ...changes } : a)),
  );
}

export function deleteAssignment(id: string): void {
  saveAssignments(getAssignments().filter((a) => a.id !== id));
}

export function addAssignments(items: Omit<Assignment, "id">[]): void {
  const created = items.map((item) => ({ ...item, id: crypto.randomUUID() }));
  saveAssignments([...getAssignments(), ...created]);
}
