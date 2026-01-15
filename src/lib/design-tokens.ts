// Evangelion-inspired color palette (Rei Ayanami + EVA-00)
export const colors = {
  light: {
    background: "#f8f9fc",
    foreground: "#1a1a3e",
    card: "rgba(248, 249, 252, 0.9)",
    cardForeground: "#1a1a3e",
    popover: "rgba(248, 249, 252, 0.95)",
    popoverForeground: "#1a1a3e",
    primary: "#5B6EE1",
    primaryForeground: "#ffffff",
    secondary: "#e8ecf7",
    secondaryForeground: "#3B4BA8",
    muted: "#f0f2f8",
    mutedForeground: "#6B7A99",
    accent: "#E53935",
    accentForeground: "#ffffff",
    destructive: "#dc2626",
    border: "rgba(91, 110, 225, 0.2)",
    input: "rgba(248, 249, 252, 0.8)",
    ring: "#5B6EE1",
  },
  dark: {
    background: "#0a0a1a",
    foreground: "#e8ecf7",
    card: "rgba(20, 20, 45, 0.85)",
    cardForeground: "#e8ecf7",
    popover: "rgba(20, 20, 45, 0.95)",
    popoverForeground: "#e8ecf7",
    primary: "#8B9AD8",
    primaryForeground: "#0a0a1a",
    secondary: "#1a1a3e",
    secondaryForeground: "#a8b4e0",
    muted: "#14142d",
    mutedForeground: "#8B9AD8",
    accent: "#E53935",
    accentForeground: "#ffffff",
    destructive: "#ef4444",
    border: "rgba(139, 154, 216, 0.2)",
    input: "rgba(20, 20, 45, 0.8)",
    ring: "#8B9AD8",
  },
  chart: {
    1: { light: "#5B6EE1", dark: "#8B9AD8" },
    2: { light: "#E53935", dark: "#EF5350" },
    3: { light: "#6B8BA3", dark: "#8BADC4" },
    4: { light: "#3B4BA8", dark: "#5B6EE1" },
    5: { light: "#4CAF50", dark: "#66BB6A" },
  },
  node: {
    purple: { light: "#d4d9f7", dark: "#2a2a5e" },
    teal: { light: "#c5d8e8", dark: "#1e3a4a" },
    yellow: { light: "#fff3cd", dark: "#4a3f1a" },
    pink: { light: "#fce4ec", dark: "#4a1a2a" },
    blue: { light: "#c5cae9", dark: "#1a237e" },
    green: { light: "#c8e6c9", dark: "#1b5e20" },
  },
} as const;

export const spacing = {
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  "3xl": "24px",
  "4xl": "28px",
  full: "9999px",
} as const;

export const typography = {
  fontFamily: {
    display: "'Space Grotesk', sans-serif",
    body: "'Noto Sans', sans-serif",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tight: "-0.015em",
    normal: "0",
    wide: "0.025em",
  },
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  lg: "0 8px 24px -8px rgba(91, 110, 225, 0.25)",
  xl: "0 12px 48px rgba(0, 0, 0, 0.12)",
  glow: {
    eva: "0 0 20px -5px rgba(91, 110, 225, 0.5), 0 0 40px -10px rgba(91, 110, 225, 0.3)",
    red: "0 0 20px -5px rgba(229, 57, 53, 0.5), 0 0 40px -10px rgba(229, 57, 53, 0.3)",
  },
  glass: {
    light: "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    dark: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(139, 154, 216, 0.3)",
  },
} as const;

export const blur = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
} as const;

export const animation = {
  duration: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
    calm: "600ms",
    gentle: "800ms",
  },
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export type ColorMode = "light" | "dark";
export type NodeColor = keyof typeof colors.node;
export type ChartColor = keyof typeof colors.chart;
