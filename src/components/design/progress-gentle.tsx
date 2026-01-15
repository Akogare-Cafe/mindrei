"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ProgressGentleProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

export const ProgressGentle = forwardRef<HTMLDivElement, ProgressGentleProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div ref={ref} className={cn("progress-gentle", className)} {...props}>
        <div
          className="progress-gentle-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

ProgressGentle.displayName = "ProgressGentle";
