"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTailwindPresetContent = getTailwindPresetContent;
/**
 * Tailwind Preset Boilerplate Generator (Anti-Slop Compliant)
 */
function getTailwindPresetContent(target = "web") {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#141817",
          orange: "#e85d3f",
        },
        background: "#fcfbf8",
        surface: {
          DEFAULT: "#f5f2ea",
          raised: "#ffffff",
        },
        foreground: {
          DEFAULT: "#141817",
          secondary: "#4d5552",
          muted: "#737b78",
          subtle: "#9ca3a0",
        },
        border: {
          DEFAULT: "#d9ddd9",
          subtle: "#e8ebe8",
          strong: "#b9bfbc",
        },
        primary: {
          DEFAULT: "#141817",
          foreground: "#fcfbf8",
        },
        accent: {
          DEFAULT: "#e85d3f",
          foreground: "#ffffff",
          soft: "#fbe4de",
        },
        status: {
          success: "#2f7d5c",
          warning: "#b7791f",
          error: "#c63d3d",
          info: "#416b8d",
        },
        moryn: {
          dark: "#141817",
          surface: "#f5f2ea",
          elevated: "#ffffff",
          border: "#d9ddd9",
          accent: "#e85d3f",
          text: {
            primary: "#141817",
            muted: "#737b78",
            dim: "#9ca3a0",
          },
          status: {
            success: "#2f7d5c",
            warning: "#b7791f",
            error: "#c63d3d",
          }
        }
      },
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        sharp: "2px",
        subtle: "4px",
        card: "6px",
      }
    }
  }
};
`;
}
