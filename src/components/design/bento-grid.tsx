"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  dense?: boolean;
}

export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, children, dense = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(dense ? "bento-grid-dense" : "bento-grid", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoGrid.displayName = "BentoGrid";

type BentoItemSize = "default" | "lg" | "wide" | "tall";

interface BentoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: BentoItemSize;
}

const sizeClasses: Record<BentoItemSize, string> = {
  default: "",
  lg: "bento-item-lg",
  wide: "bento-item-wide",
  tall: "bento-item-tall",
};

export const BentoItem = forwardRef<HTMLDivElement, BentoItemProps>(
  ({ className, children, size = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("bento-item", sizeClasses[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoItem.displayName = "BentoItem";
