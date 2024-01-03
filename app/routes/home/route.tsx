import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { requireAuthCookie } from "../../auth/auth";
import { getHomeData, createBoard } from "./query";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireAuthCookie(request);
  const boards = await getHomeData(userId);
  return { boards };
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireAuthCookie(request);
  const formData = await request.formData();
  const name = String(formData.get("name"));
  const color = String(formData.get("color"));
  if (!name) {
    return { ok: false, message: "Board name is required" };
  }

  await createBoard(userId, name, color);
  return { ok: true, message: "Board created" };
}

export default function Projects() {
  return (
    <div className="h-full bg-gray-50">
      <NewBoard />
      <Boards />
    </div>
  );
}

function Boards() {
  const { boards } = useLoaderData<typeof loader>();
  return (
    <div className="p-8">
      <h2>Boards</h2>
      <nav className="flex flex-wrap gap-8">
        {boards.map((board) => (
          <Link
            key={board.id}
            to={`/board/${board.id}`}
            className="block h-40 w-60 rounded border-b-8 bg-white p-4 shadow transition-transform hover:scale-105 hover:shadow-lg"
            style={{ borderColor: board.color }}
          >
            <div className="font-bold">{board.name}</div>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function NewBoard() {
  const fetcher = useFetcher<typeof action>();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      ref.current?.reset();
    }
  }, [fetcher]);

  return (
    <fetcher.Form method="post" ref={ref} className="max-w-md p-8">
      <div>
        <h2 className="mb-2 text-xl font-bold">New Board</h2>
        <label
          htmlFor="board-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Name{" "}
          {fetcher.data?.ok === false ? (
            <span className="text-brand-red">{fetcher.data.message}</span>
          ) : null}
        </label>
        <div className="mt-2">
          <input
            id="board-name"
            name="name"
            type="text"
            required
            className="focus:ring-indigo-600 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <label
            htmlFor="board-color"
            className="text-sm font-medium leading-6 text-gray-900"
          >
            Color
          </label>
          <input
            id="board-color"
            name="color"
            type="color"
            defaultValue="#e0e0e0"
            className="border p-0"
          />
        </div>
        <button
          type="submit"
          className="hover:bg-indigo-500 bg-indigo-400 focus-visible:outline-indigo-600 flex w-full justify-center rounded-md bg-blue-brand px-1 py-1 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Create
        </button>
      </div>
    </fetcher.Form>
  );
}
