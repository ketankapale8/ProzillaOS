import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Logger } from "@prozilla-os/shared";
import type { NavigationJSON } from "typedoc-plugin-markdown";
import { PACKAGE_PATHS, packagePathToId } from "../packages.config";

const logger = new Logger({ prefix: "[registry]" });

export type SymbolCategory = "component" | "function" | "hook" | "class" | "variable" | "enum" | "interface" | "type" | "namespace";
export type Registry = Map<string, SymbolEntry>;

export interface SymbolEntry {
	path: string;
	packageName: string;
	category?: SymbolCategory;
}

const GROUP_CATEGORIES: Record<string, SymbolCategory> = {
	"Components": "component",
	"Functions": "function",
	"Hooks": "hook",
	"Classes": "class",
	"Variables": "variable",
	"Enums": "enum",
	"Interfaces": "interface",
	"Types": "type",
	"Namespaces": "namespace",
};

export function buildSymbolRegistry(): Registry {
	const registry = new Map<string, SymbolEntry>();
	const seen = new Set<string>();
	const referenceDirectory = fileURLToPath(new URL("../../src/reference", import.meta.url));

	if (!existsSync(referenceDirectory)) {
		return registry;
	}

	const collisions: Array<{ symbol: string; kept: string; skipped: string }> = [];

	for (const packageName of PACKAGE_PATHS) {
		const navPath = fileURLToPath(new URL(`../../src/reference/${packageName}/nav.json`, import.meta.url));

		if (!existsSync(navPath))
			continue;

		let navigation: NavigationJSON;
		try {
			const content = readFileSync(navPath, "utf-8");
			navigation = JSON.parse(content) as NavigationJSON;
		} catch (error) {
			logger.warn(`Failed to read nav.json for ${packageName}:`, (error as Error).message);
			continue;
		}

		if (!Array.isArray(navigation))
			continue;

		registry.set(packagePathToId(packageName), {
			path: packageName,
			packageName,
		});

		for (const group of navigation) {
			const children = group.children;
			if (!Array.isArray(children))
				continue;

			const category = GROUP_CATEGORIES[group.title];

			for (const child of children) {
				if (!child.title || !child.path)
					continue;

				const cleanPath = child.path.replace(/\.md$/, "");

				const key = child.title + "@" + packageName;
				if (seen.has(key))
					continue;

				seen.add(key);

				if (registry.has(child.title)) {
					const existingEntry = registry.get(child.title)!;
					collisions.push({
						symbol: child.title,
						kept: existingEntry.packageName,
						skipped: packageName,
					});
					continue;
				}

				registry.set(child.title, {
					path: packageName + "/" + cleanPath,
					packageName,
					category,
				});
			}
		}
	}

	registry.set("prozilla-os", {
		path: "prozilla-os",
		packageName: "prozilla-os",
	});

	if (collisions.length > 0) {
		const crossPackageCollisions = collisions.filter(({ kept, skipped }) => kept !== skipped);
		for (const { symbol, kept, skipped } of crossPackageCollisions) {
			logger.warn(
				`Collision: ${symbol} is exported from ${kept} and ${skipped}.`,
				`Defaulting to ${kept}, write ${packagePathToId(skipped)}#${symbol} to use ${skipped} instead.`
			);
		}
	}

	return registry;
}
