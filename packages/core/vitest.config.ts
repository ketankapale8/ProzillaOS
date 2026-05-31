import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineConfig({
	test: {
		setupFiles: "./test/setup.ts",
		projects: [
			{
				test: {
					name: "features",
					include: ["test/features/**/*.test.ts"],
				},
			},
			{
				test: {
					name: "hooks",
					include: ["test/hooks/**/*.test.ts"],
					environment: "jsdom",
				},
			},
		],
	},
}));