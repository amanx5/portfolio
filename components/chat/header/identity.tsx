export function Identity({
  name,
  headline,
  website,
}: {
  name: string;
  headline: string;
  website?: string;
}) {
  const content = (
    <>
      <h1 className="truncate text-sm font-medium group-hover:underline">
        {name}
      </h1>
      <p className="truncate text-xs text-muted-foreground">{headline}</p>
    </>
  );

  if (!website) return <div className="min-w-0">{content}</div>;

  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      className="group block min-w-0"
    >
      {content}
    </a>
  );
}
