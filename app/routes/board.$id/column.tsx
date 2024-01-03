import {
  useState,
  type ReactNode,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { useFetcher } from "@remix-run/react";

import { Icon } from "../../icons/icons";

import { INTENTS, type action } from "./data";

export function Column({
  children,
  name,
  columnId,
}: {
  children: ReactNode;
  name: string;
  columnId: number;
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
    <div className="flex max-h-full w-80 flex-shrink-0 flex-col overflow-hidden rounded-xl border bg-stone-100 shadow">
      <div className="p-2">
        {edit ? (
          <fetcher.Form
            method="post"
            onBlur={(event) => {
              fetcher.submit(event.currentTarget);
            }}
          >
            <input type="hidden" name="intent" value={INTENTS.updateColumn} />
            <input type="hidden" name="columnId" value={columnId} />
            <input
              ref={editNameRef}
              type="text"
              name="name"
              defaultValue={name}
              className="w-full rounded-lg border border-stone-400 px-2 py-1 font-medium text-black"
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
            className="block w-full rounded-lg border border-transparent px-2 py-1 text-left font-medium text-stone-600"
          >
            {name || <span className="italic text-stone-400">Add name</span>}
          </button>
        )}
      </div>

      <ul className="mt-1 flex-grow overflow-auto">{children}</ul>

      <NewCard columnId={columnId} />
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
      className="-mb-[2px] border-b-2 border-t-2 border-transparent p-2"
    >
      <input type="hidden" name="intent" value={INTENTS.createItem} />
      <input type="hidden" name="columnId" value={columnId} />
      <textarea
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        ref={ref}
        name="title"
        placeholder="Enter a title for this card"
        className="h-14 w-full resize-none rounded-lg px-2 py-1 text-sm shadow outline-none placeholder:text-sm placeholder:text-stone-500"
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
          className="rounded-lg bg-brand-blue p-2 text-left text-sm font-medium text-white"
        >
          Save Card
        </button>
        <button
          type="button"
          onClick={() => setEdit(false)}
          className="rounded-lg p-2 text-left text-sm font-medium hover:bg-stone-200 focus:bg-stone-200"
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
        className="flex w-full items-center gap-2 rounded-lg p-2 text-left font-medium text-stone-500 hover:bg-stone-200 focus:bg-stone-200"
      >
        <Icon name="plus" /> Add a card
      </button>
    </div>
  );
}
