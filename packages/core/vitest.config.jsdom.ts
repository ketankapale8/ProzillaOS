import { defineProject, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineProject({
	test: {
		name: "@prozilla-os/core jsdom",
		setupFiles: "./test/setup.ts",
		environment: "jsdom",
		include: [
			"test/components/**/*.test.{ts,tsx}",
			"test/features/_utils/react.utils.test.tsx",
			"test/hooks/**/*.test.{ts,tsx}",
		],
	},
}));