import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Identity({
  name,
  headline,
  website,
  avatarUrl,
}: {
  name: string;
  headline: string;
  website?: string;
  avatarUrl?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  const content = (
    <>
      {avatarUrl && (
        // decorative: the name next to it already says who this is
        <Avatar aria-hidden>
          <AvatarImage src={avatarUrl} alt="" />
          {/* delay so the initials don't flash before the image loads; shown only if it fails */}
          <AvatarFallback delay={600}>{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className="min-w-0">
        <h1 className="truncate text-sm font-medium group-hover:underline">
          {name}
        </h1>
        <p className="truncate text-xs text-muted-foreground">{headline}</p>
      </div>
    </>
  );

  if (!website) {
    return <div className="flex min-w-0 items-center gap-2.5">{content}</div>;
  }

  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-w-0 items-center gap-2.5"
    >
      {content}
    </a>
  );
}
