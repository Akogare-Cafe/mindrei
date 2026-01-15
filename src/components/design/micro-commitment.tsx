"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface MicroCommitmentProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  selected?: boolean;
}

export const MicroCommitment = forwardRef<HTMLButtonElement, MicroCommitmentProps>(
  ({ className, children, selected = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn("micro-commitment", selected && "selected", className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

MicroCommitment.displayName = "MicroCommitment";
