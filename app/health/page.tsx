import { Suspense } from "react";

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

async function getHealthTodo(): Promise<
  { ok: true; todo: Todo } | { ok: false; message: string }
> {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos/1",
    );

    if (!response.ok) {
      return {
        ok: false,
        message: `Request failed with status ${response.status}.`,
      };
    }

    const todo = (await response.json()) as Todo;
    return { ok: true, todo };
  } catch {
    return {
      ok: false,
      message: "Unable to reach the health check endpoint.",
    };
  }
}

async function HealthResult() {
  const result = await getHealthTodo();

  if (!result.ok) {
    return (
      <p className="rounded-md border border-danger bg-surface p-md text-danger">
        {result.message}
      </p>
    );
  }

  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-surface p-md text-sm text-foreground">
      {JSON.stringify(result.todo, null, 2)}
    </pre>
  );
}

export default function HealthPage() {
  return (
    <section className="space-y-md">
      <div className="space-y-sm">
        <h1 className="text-2xl font-semibold text-foreground">Health check</h1>
        <p className="text-muted">Shows the app is up and fetching data.</p>
      </div>

      <Suspense
        fallback={
          <p className="text-muted">Checking health endpoint…</p>
        }
      >
        <HealthResult />
      </Suspense>
    </section>
  );
}
