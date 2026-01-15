"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface PixelBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "accent";
  children: React.ReactNode;
}

export const PixelBadge = forwardRef<HTMLSpanElement, PixelBadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const isAccent = variant === "accent";
    const badgeVariant = isAccent ? "default" : variant;
    
    return (
      <Badge
        ref={ref}
        variant={badgeVariant}
        className={cn(
          "font-medium tracking-wide",
          isAccent && "bg-accent text-accent-foreground hover:bg-accent/80",
          className
        )}
        {...props}
      >
        {children}
      </Badge>
    );
  }
);

PixelBadge.displayName = "PixelBadge";
