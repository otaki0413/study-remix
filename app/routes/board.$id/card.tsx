import { useState } from "react";

export function Card({
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
