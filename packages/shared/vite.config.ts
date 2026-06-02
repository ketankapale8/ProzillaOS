import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import { externalizeDeps } from "vite-plugin-externalize-deps";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		dts({
			include: ["src"],
			outDir: "dist",
			rollupTypes: true,
			strictOutput: true,
		}),
		externalizeDeps(),
	],
	build: {
		lib: {
			entry: {
				main: resolve(__dirname, "src/main.ts"),
				logging: resolve(__dirname, "src/features/logging/index.ts"),
				utils: resolve(__dirname, "src/features/_utils/index.ts"),
			},
			formats: ["es"],
		},
		rollupOptions: {
			output: {
				assetFileNames: "assets/[name][extname]",
				chunkFileNames: "chunks/[name]-[hash].js",
				entryFileNames: "[name].js",
			},
		},
		sourcemap: true,
	},
});