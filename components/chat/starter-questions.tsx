import { Button } from "@/components/ui/button";
import {
  BriefcaseIcon,
  FolderGit2Icon,
  LinkIcon,
  WrenchIcon,
} from "lucide-react";

function starterQuestions(firstName: string) {
  return [
    { icon: BriefcaseIcon, text: `What has ${firstName} worked on?` },
    { icon: FolderGit2Icon, text: `Which projects has ${firstName} built?` },
    { icon: WrenchIcon, text: `What are ${firstName}'s main skills?` },
    { icon: LinkIcon, text: `Where can I find ${firstName} online?` },
  ];
}

export function StarterQuestions({
  firstName,
  onSelect,
}: {
  firstName: string;
  onSelect: (text: string) => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {starterQuestions(firstName).map((q) => (
        <li key={q.text}>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => onSelect(q.text)}
          >
            <q.icon />
            {q.text}
          </Button>
        </li>
      ))}
    </ul>
  );
}
