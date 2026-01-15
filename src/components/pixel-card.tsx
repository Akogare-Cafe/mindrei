"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  rarity?: "common" | "uncommon" | "rare" | "legendary";
  glowColor?: string;
}

const rarityStyles = {
  common: {
    border: "border-border",
    glow: "",
    accent: "from-muted-foreground to-muted-foreground",
    shine: "",
    ring: "",
    glass: "",
  },
  uncommon: {
    border: "border-primary/50",
    glow: "",
    accent: "from-primary to-primary",
    shine: "",
    ring: "",
    glass: "glass-panel",
  },
  rare: {
    border: "border-primary",
    glow: "teal-glow",
    accent: "from-primary to-accent",
    shine: "",
    ring: "",
    glass: "glass-panel",
  },
  legendary: {
    border: "border-primary",
    glow: "teal-glow",
    accent: "from-primary via-accent to-primary",
    shine: "shimmer",
    ring: "ring-1 ring-primary/30",
    glass: "liquid-glass",
  },
};

export const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, children, rarity = "common", glowColor, ...props }, ref) => {
    const styles = rarityStyles[rarity];
    
    return (
      <Card
        ref={ref}
        className={cn(
          "fantasy-card relative overflow-hidden",
          "bg-card",
          "border rounded-2xl",
          styles.border,
          styles.glow,
          styles.shine,
          styles.ring,
          styles.glass,
          "hover:-translate-y-1",
          "calm-transition",
          "group",
          className
        )}
        style={glowColor ? { boxShadow: `0 0 12px ${glowColor}` } : undefined}
        {...props}
      >
        {rarity !== "common" && (
          <div className={cn(
            "absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r rounded-t-lg",
            styles.accent
          )} />
        )}
        
        <div className="relative z-10">
          {children}
        </div>
      </Card>
    );
  }
);

PixelCard.displayName = "PixelCard";

export const PixelCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardHeader
    ref={ref}
    className={cn(
      "relative pb-3 pt-4",
      "border-b border-border",
      className
    )}
    {...props}
  />
));
PixelCardHeader.displayName = "PixelCardHeader";

export const PixelCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn(
      "text-foreground text-base tracking-wide font-semibold",
      "font-heading",
      className
    )}
    {...props}
  />
));
PixelCardTitle.displayName = "PixelCardTitle";

export const PixelCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn("text-muted-foreground text-sm mt-2 leading-relaxed", className)}
    {...props}
  />
));
PixelCardDescription.displayName = "PixelCardDescription";

export const PixelCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContent 
    ref={ref} 
    className={cn(
      "pt-4 pb-4",
      className
    )} 
    {...props} 
  />
));
PixelCardContent.displayName = "PixelCardContent";
