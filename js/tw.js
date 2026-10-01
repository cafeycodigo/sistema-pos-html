/* Tailwind · configuración atada a los tokens de Hallmark (css/tokens.css).
 * Paleta completa reemplazada: ninguna clase por defecto de Tailwind entra en el build. */
tailwind.config = {
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      paper: "var(--color-paper)",
      paper2: "var(--color-paper-2)",
      paper3: "var(--color-paper-3)",
      rule: "var(--color-rule)",
      rule2: "var(--color-rule-2)",
      neutral: "var(--color-neutral)",
      muted: "var(--color-muted)",
      ink2: "var(--color-ink-2)",
      ink: "var(--color-ink)",
      graphite: "var(--color-graphite)",
      graphite2: "var(--color-graphite-2)",
      accent: "var(--color-accent)",
      accentsoft: "var(--color-accent-soft)",
      accentink: "var(--color-accent-ink)",
      focus: "var(--color-focus)",
      success: "var(--color-success)",
      error: "var(--color-error)",
      warning: "var(--color-warning)"
    },
    fontFamily: {
      display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
      body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "ui-monospace", "Cascadia Mono", "monospace"]
    },
    borderRadius: { none: "0", sm: "var(--radius-sm)", DEFAULT: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-md)", full: "9999px" },
    boxShadow: { whisper: "var(--shadow-whisper)" },
    extend: {
      spacing: {
        "4.5": "1.125rem",
        "18": "4.5rem",
        "22": "5.5rem"
      }
    }
  }
};
