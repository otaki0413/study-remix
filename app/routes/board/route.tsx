import { type ReactNode } from "react";
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
  return (
    <li>
      <div className="m-3 rounded bg-white p-2 shadow">
        <h3 className="font-bold">{company.name}</h3>
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
