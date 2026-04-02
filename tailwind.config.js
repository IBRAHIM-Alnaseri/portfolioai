/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        accent: '#7c6dfa',
        accent2: '#fa6d9a',
        accent3: '#6dfacc',
        supabase: '#3fcf8e',
        clerk: '#6c47ff',
        stripe: '#635bff',
      }
    },
  },
  plugins: [],
}
