/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                accent: {
                    DEFAULT: 'var(--accent-color)',
                    50: 'var(--accent-color-50)',
                    100: 'var(--accent-color-100)',
                    200: 'var(--accent-color-200)',
                    600: 'var(--accent-color-600)',
                    700: 'var(--accent-color-700)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        }
    },
    plugins: [],
}
