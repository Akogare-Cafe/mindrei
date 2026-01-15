"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface AssistiveHintProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  visible?: boolean;
}

export const AssistiveHint = forwardRef<HTMLDivElement, AssistiveHintProps>(
  ({ className, children, visible = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("assistive-hint", visible && "visible", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AssistiveHint.displayName = "AssistiveHint";
