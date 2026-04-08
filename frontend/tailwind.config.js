/** @type {import('tailwindcss').Config} */
export const content = ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
    extend: {
        fontFamily: {
            sans: ["Inter", "sans-serif"],
        },
    },
};
export const plugins = [require("tailwind-scrollbar")];
