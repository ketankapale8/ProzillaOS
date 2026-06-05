import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: [
			"!packages/*.md",
			"packages/!(apps)*",
			"packages/*/vitest.config.*.ts",
			"packages/apps/*",
			"packages/apps/*/vitest.config.*.ts",
		],
	},
});