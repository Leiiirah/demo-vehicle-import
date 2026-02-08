import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * ScrollableDialogContent
 * A DialogContent wrapper that enforces:
 * - max-h-[90dvh] for proper mobile viewport handling
 * - flex column layout with overflow-hidden
 * - No padding (p-0) so header/body/footer can manage their own
 */
const ScrollableDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, children, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn(
      "max-h-[90dvh] min-h-0 flex flex-col gap-0 overflow-hidden p-0",
      className
    )}
    {...props}
  >
    {children}
  </DialogContent>
));
ScrollableDialogContent.displayName = "ScrollableDialogContent";

/**
 * ScrollableDialogHeader
 * Fixed header area that doesn't scroll
 */
const ScrollableDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("shrink-0 px-6 pt-6 pb-2", className)}
    {...props}
  />
));
ScrollableDialogHeader.displayName = "ScrollableDialogHeader";

/**
 * ScrollableDialogBody
 * The scrollable region using native overflow-y-auto
 * This avoids Radix ScrollArea issues in fixed dialogs
 */
const ScrollableDialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-4",
      "[-webkit-overflow-scrolling:touch]",
      className
    )}
    {...props}
  />
));
ScrollableDialogBody.displayName = "ScrollableDialogBody";

/**
 * ScrollableDialogFooter
 * Fixed footer area with actions, always visible
 */
const ScrollableDialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-border bg-background",
      className
    )}
    {...props}
  />
));
ScrollableDialogFooter.displayName = "ScrollableDialogFooter";

export {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  ScrollableDialogContent,
  ScrollableDialogHeader,
  ScrollableDialogBody,
  ScrollableDialogFooter,
};
