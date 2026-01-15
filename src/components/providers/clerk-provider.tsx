"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export function ClerkClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#8b5cf6",
          colorBackground: "#0a0f1a",
          colorInputBackground: "#0a0f1a",
          colorInputText: "#8b5cf6",
          colorText: "#8b5cf6",
          colorTextSecondary: "#8b5cf6",
          borderRadius: "0px",
        },
        elements: {
          card: "border-4 border-border bg-background",
          headerTitle: "text-primary",
          headerSubtitle: "text-muted-foreground",
          formButtonPrimary: "bg-primary hover:bg-primary text-background border-4 border-border",
          formFieldInput: "border-4 border-border bg-[#0a0f1a] text-primary",
          footerActionLink: "text-muted-foreground hover:text-primary",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
