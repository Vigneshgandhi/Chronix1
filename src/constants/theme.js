// Central design tokens for Chronix.
// NativeWind utility classes cover most styling (see tailwind.config.js),
// but native primitives like Svg, LinearGradient and Animated interpolations
// need raw JS values — this file is the single source of truth for both.

export const colors = {
  primary: "#2563EB",
  primaryDim: "#1D4ED8",
  primaryGlow: "#3B82F6",
  background: "#0B1120",
  backgroundDeep: "#070B14",
  card: "#111827",
  cardElevated: "#161F2E",
  border: "#1F2937",
  textPrimary: "#E5E9F0",
  textSecondary: "#8B95A7",
  textMuted: "#5B6478",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  displayTracking: 6,
  displayWeight: "700",
  bodyWeight: "400",
  labelWeight: "600",
};
