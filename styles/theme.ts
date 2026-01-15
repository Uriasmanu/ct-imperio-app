/* ======================================================
   BASE COMUM (Dark + Gold)
====================================================== */
const baseTheme = {
    colors: {
        primary: "#D4AF37",
        primaryDark: "#B8860B",
        background: "#0B0B0B",
        card: "#1A1A1A",
        cardActive: "#2A2A2A",
        border: "#B8860B",
        text: {
            primary: "#D4AF37",
            secondary: "#E0E0E0",
            muted: "#A0A0A0",
            white: "#FFFFFF",
        },
        success: "#10B981",
        error: "#EF4444",
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
};

/* ======================================================
   PAGAMENTO PIX + TATAME (idênticos)
====================================================== */
export const pixTatameTheme = {
    ...baseTheme,
    typography: {
        title: 28,
        subtitle: 18,
        body: 14,
        caption: 12,
    },
};

/* ======================================================
   AULAS (variação do base)
====================================================== */
export const aulasTheme = {
    ...baseTheme,
    colors: {
        ...baseTheme.colors,
        background: "#000000",
        text: {
            ...baseTheme.colors.text,
            primary: "#FFFFFF",
            secondary: "#E5E5E5",
            muted: "#888888",
            accent: "#FFD700",
        },
        status: {
            current: "#FFD700",
            upcoming: "#4ADE80",
            finished: "#6B7280",
        },
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
    },
};

/* ======================================================
   FAQ (tema próprio, mas herda identidade)
====================================================== */
export const faqTheme = {
    ...baseTheme,
    colors: {
        ...baseTheme.colors,
        primaryLight: "#E0C96D",
        background: "#000000",
        card: "#2B2B2B",
        cardActive: "#3A3A3A",
        border: "#333333",
        text: {
            primary: "#D4AF37",
            secondary: "#E0C96D",
            body: "#DDDDDD",
            muted: "#CCCCCC",
            dark: "#1C1C1C",
        },
        success: "#4CAF50",
    },
    typography: {
        title: 36,
        subtitle: 18,
        body: 16,
        caption: 14,
        small: 12,
    },
    borderRadius: {
        sm: 6,
        md: 12,
        lg: 25,
    },
};

/* ======================================================
   AVISOS (tema totalmente exclusivo)
====================================================== */
export const avisosTheme = {
    colors: {
        backgrounds: {
            yellow: "#FFD700",
            gray: "#4B5563",
            red: "#DC2626",
            green: "#059669",
        },
        texts: {
            onYellow: "#000000",
            onDark: "#FFFFFF",
        },
        accents: {
            yellowBadge: "#000000",
            darkBadge: "#FFD700",
        },
        fightYellow: "#FFD700",
        arenaBlack: "#1A1A1A",
        gray400: "#9CA3AF",
        gray300: "#D1D5DB",
    },
};
