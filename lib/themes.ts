export interface ThemePalette {
  id: string;
  name: string;
  bg_main: string;
  bg_card: string;
  bg_sidebar: string;
  border: string;
  text_main: string;
  text_muted: string;
  accent: string;
  accent_hover: string;
  accent_gradient: string;
  btn_play_gradient: string;
  btn_play_border: string;
  btn_pause_gradient: string;
  btn_pause_border: string;
  btn_step_gradient: string;
  btn_step_border: string;
  mpl: {
    fig_bg: string;
    ax_bg: string;
    primary: string;
    highlight: string;
    success: string;
    inactive: string;
    edge: string;
    text: string;
    border: string;
  };
}

export const THEMES: { dark: ThemePalette; light: ThemePalette } = {
  dark: {
    id: "sunset",
    name: "🌆  Sunset Amber",
    bg_main: "#171412",
    bg_card: "#211c19",
    bg_sidebar: "#0d0b0a",
    border: "#3b302a",
    text_main: "#fffbeb",
    text_muted: "#a89b91",
    accent: "#f59e0b",
    accent_hover: "#d97706",
    accent_gradient: "linear-gradient(to right, #f59e0b, #ea580c)",
    btn_play_gradient: "linear-gradient(to bottom, #f59e0b, #ea580c)",
    btn_play_border: "#c2410c",
    btn_pause_gradient: "linear-gradient(to bottom, #ef4444, #dc2626)",
    btn_pause_border: "#b91c1c",
    btn_step_gradient: "linear-gradient(to bottom, #d97706, #b45309)",
    btn_step_border: "#92400e",
    mpl: {
      fig_bg: "#171412",
      ax_bg: "#211c19",
      primary: "#f59e0b",
      highlight: "#ef4444",
      success: "#10b981",
      inactive: "#3b302a",
      edge: "#d97706",
      text: "#fffbeb",
      border: "#3b302a",
    },
  },
  light: {
    id: "light",
    name: "☀️  Nordic Light",
    bg_main: "#f1f5f9",
    bg_card: "#ffffff",
    bg_sidebar: "#e2e8f0",
    border: "#cbd5e1",
    text_main: "#0f172a",
    text_muted: "#475569",
    accent: "#059669",
    accent_hover: "#047857",
    accent_gradient: "linear-gradient(to right, #059669, #047857)",
    btn_play_gradient: "linear-gradient(to bottom, #059669, #047857)",
    btn_play_border: "#065f46",
    btn_pause_gradient: "linear-gradient(to bottom, #ea580c, #c2410c)",
    btn_pause_border: "#9a3412",
    btn_step_gradient: "linear-gradient(to bottom, #0d9488, #0f766e)",
    btn_step_border: "#115e59",
    mpl: {
      fig_bg: "#f1f5f9",
      ax_bg: "#ffffff",
      primary: "#059669",
      highlight: "#dc2626",
      success: "#16a34a",
      inactive: "#e2e8f0",
      edge: "#047857",
      text: "#0f172a",
      border: "#cbd5e1",
    },
  },
};
