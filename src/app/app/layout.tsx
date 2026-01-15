import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - MindRei",
  description: "Create and manage your voice-powered mind maps",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
