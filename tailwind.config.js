/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: '#080F1E',
                surface: '#0D1829',
                surface2: '#111F35',
                blue: {
                    DEFAULT: '#1A6BFF',
                },
                cyan: {
                    DEFAULT: '#00D4FF',
                },
                yellow: {
                    DEFAULT: '#FFD600',
                },
                green: {
                    DEFAULT: '#00E5A0',
                },
                coral: {
                    DEFAULT: '#FF6B6B',
                },
                white: {
                    DEFAULT: '#EEF4FF',
                },
            },
            fontFamily: {
                syne: ['Syne', 'sans-serif'],
                dm: ['DM Sans', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '16px',
                '3xl': '24px',
            }
        },
    },
    plugins: [],
}
