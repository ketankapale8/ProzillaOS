import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		dts({
			include: ["src"],
			outDir: "dist",
			rollupTypes: true,
			strictOutput: true,
			pathsToAliases: false,
			tsconfigPath: "tsconfig.build.json",
		}),
	],
	build: {
		lib: {
			entry: {
				main: resolve(__dirname, "src/main.ts"),
				test: resolve(__dirname, "src/features/test.ts"),
				vite: resolve(__dirname, "src/plugins/index.ts"),
			},
			formats: ["es"],
		},
		rollupOptions: {
			external: ["vite", /^node:/, "typescript", /vite-plugin-/g, /@vitejs\/plugin-/g, "rollup", "@prozilla-os/core", "@prozilla-os/shared", "@inquirer/core"],
			output: {
				assetFileNames: "assets/[name][extname]",
				chunkFileNames: "chunks/[name]-[hash].js",
				entryFileNames: "[name].js",
			},
		},
		sourcemap: true,
	},
});