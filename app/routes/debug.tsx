export default function Layout() {
  return (
    <div className="flex h-full flex-col bg-green-100">
      <div className="bg-gray-200 p-4">Project name</div>
      <div className="flex-grow overflow-hidden bg-gray-300 p-4">
        <div className="flex h-full items-start gap-8">
          <Board name="one" small />
          <Board name="two" />
          <Board name="three" />
        </div>
      </div>
    </div>
  );
}

function Board({ name, small }: { name: string; small?: boolean }) {
  return (
    <div className="flex max-h-full w-60 flex-shrink-0 flex-col bg-green-100">
      <div className="bg-red-200 p-4">{name}</div>

      <div className="flex-grow overflow-auto bg-red-300 p-4">
        Content area...
        {!small && (
          <>
            <div style={{ height: 2000 }} />
            More content
          </>
        )}
      </div>
    </div>
  );
}
