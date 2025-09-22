/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Simple Setup Brand Colors (Orange Theme)
        'brand': {
          DEFAULT: 'hsl(20 100% 54%)', // Bright Orange - Primary CTAs, highlights, step numbers
          50: 'hsl(20 100% 97%)',      // Light orange backgrounds
          100: 'hsl(20 100% 94%)',
          200: 'hsl(20 100% 88%)',
          300: 'hsl(20 100% 78%)',
          400: 'hsl(20 100% 68%)',      // Border states
          500: 'hsl(20 100% 54%)',      // Primary orange
          600: 'hsl(20 95% 45%)',
          700: 'hsl(20 90% 38%)',
          800: 'hsl(20 85% 32%)',
          900: 'hsl(20 80% 26%)',
        },
        'success': {
          DEFAULT: 'hsl(142 69% 58%)', // Green for checkmarks, confirmations
          50: 'hsl(142 69% 97%)',
          100: 'hsl(142 69% 94%)',
          500: 'hsl(142 69% 58%)',
          600: 'hsl(142 69% 50%)',
        },
        // Legacy colors (keep for compatibility)
        'gradient-start': '#000000',
        'gradient-end': '#C0C0C0',
        'orange-gradient-start': 'hsl(20 100% 54%)',
        'orange-gradient-end': 'hsl(20 100% 68%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'merriweather': ['var(--font-merriweather)', 'serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'lora': ['var(--font-lora)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}