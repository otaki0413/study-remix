import { useFetcher, useLoaderData } from "@remix-run/react";
import { Icon } from "../../icons/icons";
import { INTENTS, loader, action } from "./data";
import { Column } from "./column";
import { Card } from "./card";
export { loader, action };

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
          <Column key={col.id} name={col.name} columnId={col.id}>
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
