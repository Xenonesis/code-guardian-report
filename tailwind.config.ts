// Tailwind CSS v4 uses CSS-first configuration
// Most configuration is now in src/styles/base.css using @theme directive
// This file is kept for compatibility with tools that expect it

export default {
	darkMode: ["class", ".dark"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
};
