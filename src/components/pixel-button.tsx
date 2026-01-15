"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "glass";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
}

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative tracking-wide font-semibold",
          "border-none rounded-xl",
          "bg-primary text-primary-foreground",
          "hover:opacity-90",
          "hover:-translate-y-0.5",
          "active:translate-y-0",
          "calm-transition",
          size === "sm" && "text-xs px-3 py-1.5",
          size === "default" && "text-sm px-5 py-2.5",
          size === "lg" && "text-base px-7 py-3",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === "outline" && "bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
          variant === "ghost" && "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
          variant === "glass" && "glass-panel bg-card/50 text-foreground border border-border hover:border-primary",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

PixelButton.displayName = "PixelButton";
