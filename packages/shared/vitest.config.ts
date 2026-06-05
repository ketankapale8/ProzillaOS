import { defineProject, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineProject({
	test: {
		typecheck: {
			enabled: true,
		},
	},
}));