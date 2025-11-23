/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#00FF62', // Neon Green
                secondary: '#111111', // Dark
                accent: '#0B0B0F', // Darker Accent
                background: '#F4F7FA', // Light BG
                surface: '#FFFFFF', // White Surface
                'text-primary': '#111111',
                'text-secondary': '#6B7280',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Poppins', 'Montserrat', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
