import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "cn";
import type { ProfileLink } from "@/contexts/app-context";
import { GlobeIcon } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

// lucide has no brand icons, so GitHub and LinkedIn come from react-icons; anything else gets a globe
function linkIcon(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host === "github.com") return FaGithub;
  if (host === "linkedin.com") return FaLinkedin;
  return GlobeIcon;
}

export function Identity({
  name,
  headline,
  links,
  avatarUrl,
}: {
  name: string;
  headline: string;
  links: ProfileLink[];
  avatarUrl?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  const avatar = (
    <Avatar>
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      {/* delay so the initials don't flash before the image loads; shown only if it fails */}
      <AvatarFallback delay={avatarUrl ? 600 : 0}>{initials}</AvatarFallback>
    </Avatar>
  );

  return (
    <Popover>
      {/* openOnHover: hover opens it with a mouse; touch and keyboard still open it on press */}
      <PopoverTrigger
        openOnHover
        aria-label={`About ${name}`}
        className="flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {avatar}
      </PopoverTrigger>
      {/* the 44px tap area is 6px wider than the avatar on each side; offset so the card lines up with the avatar and sits 4px below it */}
      <PopoverContent
        align="end"
        alignOffset={6}
        sideOffset={-2}
        // a compact menu-style card, like GitHub's account menu: smaller radius and padding
        className="w-auto min-w-56 gap-1 rounded-xl p-2"
      >
        <div className="flex items-center gap-3 px-2 py-1.5">
          {avatar}
          <PopoverHeader className="gap-0">
            <PopoverTitle className="text-sm font-semibold">
              {name}
            </PopoverTitle>
            <PopoverDescription className="text-xs">
              {headline}
            </PopoverDescription>
          </PopoverHeader>
        </div>
        {links.length > 0 && <Separator className="my-1" />}
        {/* every link from profile.json, in its order */}
        {links.map((link) => {
          const Icon = linkIcon(link.url);
          return (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start gap-2.5 rounded-md px-2 font-normal pointer-coarse:h-11", // 44px tap target on touch screens
              )}
            >
              <Icon className="size-4 text-muted-foreground" />
              {link.label}
            </a>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
