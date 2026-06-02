import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineConfig({
	test: {
		setupFiles: "./test/setup.ts",
		projects: [
			{
				extends: true,
				test: {
					name: "components",
					include: ["test/components/**/*.test.{ts,tsx}", "test/features/_utils/react.utils.test.tsx"],
					environment: "jsdom",
				},
			},
			{
				extends: true,
				test: {
					name: "features",
					include: ["test/features/**/*.test.ts"],
					exclude: ["test/features/_utils/react.utils.test.tsx"],
				},
			},
			{
				extends: true,
				test: {
					name: "hooks",
					include: ["test/hooks/**/*.test.{ts,tsx}"],
					environment: "jsdom",
				},
			},
		],
	},
}));