import {
  useState,
  type ReactNode,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { requireAuthCookie } from "../../auth/auth";
import invariant from "tiny-invariant";
import {
  getBoardData,
  createEmptyColumn,
  updateColumnName,
  createItem,
} from "./query";
import { badRequest, notFound } from "../../http/bad-response";
import { Icon } from "../../icons/icons";

const INTENTS = {
  newColumn: "newColumn" as const,
  updateColumn: "updateColumn" as const,
  createItem: "createItem" as const,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuthCookie(request);

  const id = Number(params.id);
  invariant(id, "Missing board ID");

  const board = await getBoardData(id);
  if (!board) throw notFound();

  return { board };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const id = Number(params.id);
  invariant(id, "Missing board ID");

  const data = await request.formData();
  const intent = String(data.get("intent"));
  if (!intent) throw badRequest("Missing intent");

  switch (intent) {
    case INTENTS.newColumn: {
      await createEmptyColumn(id);
      break;
    }
    case INTENTS.updateColumn: {
      const name = String(data.get("name"));
      const columnId = Number(data.get("columnId"));
      if (!name || !columnId) throw badRequest("Missing name or columnId");
      await updateColumnName(columnId, name);
      break;
    }
    case INTENTS.createItem: {
      const title = String(data.get("title"));
      const columnId = Number(data.get("columnId"));
      if (!title || !columnId) throw badRequest("Missing title or columnId");
      await createItem(columnId, title);
      break;
    }
  }

  return request.headers.get("Sec-Fetch-Dest") === "document"
    ? redirect(`/board/${id}`)
    : { ok: true };
}

export default function Board() {
  const { board } = useLoaderData<typeof loader>();

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-x-scroll"
      style={{ backgroundColor: board.color }}
    >
      <h1 className="my-4 px-8 text-2xl font-medium">{board.name}</h1>
      <div className="flex h-full min-h-0 flex-grow items-start gap-4 px-8 pb-4">
        {board.columns.map((col) => (
          <Column key={col.id} name={col.name} id={col.id}>
            {col.items.map((item) => (
              <Card
                key={item.id}
                title={item.title}
                content={item.content}
                id={item.id}
              />
            ))}
          </Column>
        ))}
        <NewColumn />
      </div>
    </div>
  );
}

function NewColumn() {
  const fetcher = useFetcher<typeof action>();

  return (
    <fetcher.Form method="post">
      <button
        aria-label="new column"
        name="intent"
        value={INTENTS.newColumn}
        className="flex h-16 w-16 justify-center rounded bg-black bg-opacity-10 hover:bg-white hover:bg-opacity-5"
      >
        <Icon name="plus" size="xl" />
      </button>
    </fetcher.Form>
  );
}

function Column({
  children,
  name,
  id,
}: {
  children: ReactNode;
  name: string;
  id: number;
}) {
  const fetcher = useFetcher();
  const [edit, setEdit] = useState(false);
  const editNameRef = useRef<HTMLInputElement>(null);
  const editNameButtonRef = useRef<HTMLButtonElement>(null);

  // optimistic update
  if (fetcher.formData?.has("name")) {
    name = String(fetcher.formData.get("name"));
  }

  // manage focus
  useEffect(() => {
    if (document.activeElement !== document.body) {
      return;
    }
    if (edit) {
      editNameRef.current?.select();
    } else {
      editNameButtonRef.current?.focus();
    }
  }, [edit]);

  // reset edit state whenever the fetcher starts a new request
  useEffect(() => {
    if (fetcher.state !== "idle") {
      setEdit(false);
    }
  }, [fetcher]);

  return (
    <div className="bg-stone-100 flex max-h-full w-80 flex-shrink-0 flex-col overflow-hidden rounded-xl border shadow">
      <div className="p-2">
        {edit ? (
          <fetcher.Form
            method="post"
            onBlur={(event) => {
              fetcher.submit(event.currentTarget);
            }}
          >
            <input type="hidden" name="intent" value={INTENTS.updateColumn} />
            <input type="hidden" name="columnId" value={id} />
            <input
              ref={editNameRef}
              type="text"
              name="name"
              defaultValue={name}
              className="border-stone-400 w-full rounded-lg border px-2 py-1 font-medium text-black"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setEdit(false);
                }
              }}
            />
          </fetcher.Form>
        ) : (
          <button
            aria-label={`Edit column "${name}" name`}
            ref={editNameButtonRef}
            onClick={() => setEdit(true)}
            type="button"
            className="border-transparent text-stone-600 block w-full rounded-lg border px-2 py-1 text-left font-medium"
          >
            {name || <span className="text-stone-400 italic">Add name</span>}
          </button>
        )}
      </div>

      <ul className="mt-1 flex-grow overflow-auto">{children}</ul>

      <NewCard columnId={id} />
    </div>
  );
}

function NewCard({ columnId }: { columnId: number }) {
  const [edit, setEdit] = useState(false);
  const fetcher = useFetcher<typeof action>();
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (fetcher.state === "submitting") {
      if (ref.current) ref.current.value = "";
    }
  }, [fetcher]);

  return edit ? (
    <fetcher.Form
      method="post"
      className="border-transparent -mb-[2px] border-b-2 border-t-2 p-2"
    >
      <input type="hidden" name="intent" value={INTENTS.createItem} />
      <input type="hidden" name="columnId" value={columnId} />
      <textarea
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        ref={ref}
        name="title"
        placeholder="Enter a title for this card"
        className="placeholder:text-stone-500 h-14 w-full resize-none rounded-lg px-2 py-1 text-sm shadow outline-none placeholder:text-sm"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            fetcher.submit(event.currentTarget.form);
          }
          if (event.key === "Escape") {
            setEdit(false);
          }
        }}
        onChange={(event) => {
          const el = event.currentTarget;
          el.style.height = el.scrollHeight + "px";
        }}
      />
      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-brand-blue rounded-lg p-2 text-left text-sm font-medium text-white"
        >
          Save Card
        </button>
        <button
          type="button"
          onClick={() => setEdit(false)}
          className="hover:bg-stone-200 focus:bg-stone-200 rounded-lg p-2 text-left text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </fetcher.Form>
  ) : (
    <div className="p-1">
      <button
        type="button"
        onClick={() => {
          setEdit(true);
        }}
        className="text-stone-500 hover:bg-stone-200 focus:bg-stone-200 flex w-full items-center gap-2 rounded-lg p-2 text-left font-medium"
      >
        <Icon name="plus" /> Add a card
      </button>
    </div>
  );
}

function Card({
  title,
  content,
  id,
}: {
  title: string;
  content: string | null;
  id: number;
}) {
  const [acceptDrop, setAcceptDrop] = useState<"none" | "top" | "bottom">(
    "none",
  );
  return (
    <li
      onDragOver={(event) => {
        console.log(event.dataTransfer.types);
        if (event.dataTransfer.types.includes("application/remix-demo")) {
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          const midpoint = (rect.top + rect.bottom) / 2;
          setAcceptDrop(event.clientY < midpoint ? "top" : "bottom");
        }
      }}
      onDragLeave={() => {
        setAcceptDrop("none");
      }}
      onDrop={(event) => {
        const data = event.dataTransfer.getData("application/remix-demo");
        setAcceptDrop("none");
        console.log(data);
      }}
      className={
        "-mb-[2px] cursor-grab border-b-2 border-t-2 px-2 py-1 active:cursor-grabbing " +
        (acceptDrop === "top"
          ? "border-t-brand-red border-b-transparent"
          : acceptDrop === "bottom"
            ? "border-b-brand-red border-t-transparent"
            : "border-t-transparent border-b-transparent")
      }
    >
      <div
        className="w-full rounded-lg bg-white px-2 py-1 text-sm shadow"
        draggable
        onDragStart={(event) => {
          console.log("drag start", title);
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("application/remix-demo", String(id));
        }}
      >
        <h3>{title}</h3>
        <div className="mt-2">{content || <>&nbsp;</>}</div>
      </div>
    </li>
  );
}
