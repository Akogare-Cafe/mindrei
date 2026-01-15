"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  CreditCard,
  HelpCircle,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export function UserDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { mode, toggleMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!user) return null;

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      href: "/app/profile",
    },
    {
      icon: mode === "dark" ? Sun : Moon,
      label: mode === "dark" ? "Light Mode" : "Dark Mode",
      onClick: () => {
        toggleMode();
      },
    },
    {
      icon: CreditCard,
      label: "Subscription",
      badge: "Pro",
      href: "/app/subscription",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/app/settings",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      href: "/app/help",
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-200 group"
      >
        <div className="relative">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || "User"}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
              {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-foreground leading-tight">
            {user.firstName || "User"}
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            {user.primaryEmailAddress?.emailAddress?.split("@")[0]}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 origin-top-right"
          >
            <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden">
              {/* User Info Header */}
              <div className="p-4 border-b border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex items-center gap-3">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                      {user.firstName?.[0] || "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {user.fullName || "User"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
                {/* Plan Badge */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">Free Plan</span>
                  </div>
                  <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Upgrade →
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {menuItems.map((item, index) => {
                  const content = (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium">
                          {item.badge}
                        </span>
                      )}
                    </>
                  );

                  if (item.href) {
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted/50 transition-colors group"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted/50 transition-colors group"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>

              {/* Sign Out */}
              <div className="p-2 border-t border-border/50">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-destructive/10 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-destructive/10 flex items-center justify-center transition-colors">
                    <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-destructive transition-colors">
                    Sign Out
                  </span>
                </button>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border/50 bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  MindRei v1.0 • <span className="text-primary">EVA-00 Theme</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
