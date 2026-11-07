import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RotateCcwIcon } from "lucide-react";

export function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Retry answer"
            onClick={onRetry}
          />
        }
      >
        <RotateCcwIcon />
      </TooltipTrigger>
      <TooltipContent>Retry answer</TooltipContent>
    </Tooltip>
  );
}
