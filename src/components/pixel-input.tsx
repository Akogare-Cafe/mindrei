"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const PixelInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn(
      "border-border bg-input text-foreground",
      "focus:ring-2 focus:ring-primary/50",
      className
    )}
    {...props}
  />
));

PixelInput.displayName = "PixelInput";
