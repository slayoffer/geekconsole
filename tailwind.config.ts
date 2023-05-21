import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './public/**/*.html',
    'node_modules/flowbite/**/*.js',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': 'var(--primary-color)',
        'secondary-color': 'var(--secondary-color)',
      },
    },
  },
  plugins: [require('flowbite/plugin')],
} satisfies Config;
