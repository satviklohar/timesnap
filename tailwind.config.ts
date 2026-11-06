import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { paper: "#F7F6F2", ink: "#171717", orange: "#FF5A1F", lime: "#C8F169" },
      fontFamily: { sans: ["var(--font-sans)"], mono: ["var(--font-mono)"] },
      keyframes: {
        rise: { "0%": { transform: "translateY(12px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        pop: { "0%": { transform: "scale(.85)", opacity: "0" }, "60%": { transform: "scale(1.05)" }, "100%": { transform: "scale(1)", opacity: "1" } },
        stamp: { "0%": { transform: "scale(2.2) rotate(-14deg)", opacity: "0" }, "70%": { transform: "scale(.94) rotate(-6deg)", opacity: "1" }, "100%": { transform: "scale(1) rotate(-6deg)", opacity: "1" } },
        shake: { "0%,100%": { transform: "translateX(0)" }, "25%": { transform: "translateX(-5px)" }, "75%": { transform: "translateX(5px)" } },
        confetti: { "0%": { transform: "translateY(-10vh) rotate(0)", opacity: "1" }, "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: ".9" } },
        hop: { "0%,100%": { transform: "translateY(0)" }, "40%": { transform: "translateY(-14px)" } },
        fade: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
      animation: {
        rise: "rise .35s cubic-bezier(.2,.8,.2,1) both",
        pop: "pop .4s cubic-bezier(.2,.9,.3,1.3) both",
        stamp: "stamp .45s cubic-bezier(.2,.9,.3,1.2) .5s both",
        shake: "shake .3s ease-in-out",
        confetti: "confetti 2.4s ease-in forwards",
        fade: "fade .5s ease-out 1s both",
      },
    },
  },
  plugins: [],
} satisfies Config;
