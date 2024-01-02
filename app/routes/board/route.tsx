import { useState, type ReactNode } from "react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { type Company, getCompanies } from "../../fake-data";
import { groupCompanies, sortByStatusOrder } from "./utils";
import { Icon } from "./icons";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loader(_: LoaderFunctionArgs) {
  return { companies: await getCompanies() };
}

export default function Board() {
  const { companies } = useLoaderData<typeof loader>();
  const columns = groupCompanies(companies, "status");

  return (
    <div className="flex h-full flex-col overflow-x-scroll bg-white">
      <div className="flex h-full gap-4 p-4">
        {Object.keys(columns)
          .sort(sortByStatusOrder(["New", "Active", "Inactive"]))
          .map((status) => (
            <Column key={status} status={status} count={columns[status].length}>
              {columns[status].map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </Column>
          ))}
      </div>
    </div>
  );
}

function Column({
  children,
  status,
  count,
}: {
  children: ReactNode;
  status: string;
  count: number;
}) {
  return (
    <div className="box-border flex h-full w-80 flex-shrink-0 flex-col rounded-md border border-gray-100 bg-gray-50">
      <h2 className="p-2">
        <span className="text-sm font-bold text-gray-800">{status}</span>{" "}
        <span className="inline-block min-w-[1.5em] rounded-full bg-gray-100 px-1 text-center text-xs">
          {count}
        </span>
      </h2>
      <ul className="mt-1 flex-grow overflow-auto">{children}</ul>
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const [acceptDrop, setAcceptDrop] = useState<"none" | "top" | "bottom">(
    "none",
  );
  return (
    <li
      onDragOver={(e) => {
        console.log(e.dataTransfer.types);
        if (e.dataTransfer.types.includes("application/remix-demo")) {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          const midpoint = (rect.top + rect.bottom) / 2;
          setAcceptDrop(e.clientY < midpoint ? "top" : "bottom");
        }
      }}
      onDragLeave={() => {
        setAcceptDrop("none");
      }}
      onDrop={(e) => {
        const data = e.dataTransfer.getData("application/remix-demo");
        setAcceptDrop("none");
        console.log(data);
      }}
      className={
        "-mb-[2px] cursor-grab border-b-2 border-t-2 active:cursor-grabbing " +
        (acceptDrop === "top"
          ? "border-b-transparent border-t-red-brand"
          : acceptDrop === "bottom"
            ? "border-t-transparent border-b-red-brand"
            : "border-t-transparent border-b-transparent")
      }
    >
      <div
        className="mx-3 my-1 rounded border border-gray-100 bg-white p-2 shadow-sm"
        draggable
        onDragStart={(e) => {
          console.log("drag start", company.id);
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("application/remix-demo", company.id);
        }}
      >
        <h3 className="font-bold">
          {company.name} {company.order}
        </h3>
        <div className="flex gap-2 text-gray-600">
          <Icon name="pin" /> <span>{company.city}</span>
        </div>
        <div className="flex gap-2 text-gray-600">
          <Icon name="mail" />{" "}
          <a href={`mailto:${company.email}`}>{company.contact}</a>
        </div>
      </div>
    </li>
  );
}
