"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface DepthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  layer?: 1 | 2 | 3;
}

export const DepthCard = forwardRef<HTMLDivElement, DepthCardProps>(
  ({ className, children, layer = 1, ...props }, ref) => {
    const layerClass = `spatial-layer-${layer}`;

    return (
      <div
        ref={ref}
        className={cn("depth-card", layerClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DepthCard.displayName = "DepthCard";
