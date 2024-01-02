import iconsHref from "./icons.svg";

export function Icon({ name }: { name: string }) {
  return (
    <svg className="inline h-4 w-4 self-center">
      <use href={`${iconsHref}#${name}`} />
    </svg>
  );
}
