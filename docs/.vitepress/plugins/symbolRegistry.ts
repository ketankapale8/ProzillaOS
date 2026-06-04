import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Logger } from "@prozilla-os/shared/logging";
import { resolveUrl } from "@prozilla-os/shared/utils";
import type { NavigationJSON } from "typedoc-plugin-markdown";
import { PACKAGE_PATHS, packagePathToId } from "../packages.config";

const logger = new Logger({ prefix: "[registry]" });

export type SymbolCategory =
	| "app"
	| "component"
	| "function"
	| "hook"
	| "class"
	| "variable"
	| "enum"
	| "interface"
	| "type"
	| "namespace"
	| "package";

export interface SymbolEntry {
	path: string;
	packageName: string;
	type: SymbolCategory;
	href: string;
}

type Collision = { symbol: string; kept: string; skipped: string };

const GROUP_TO_TYPE: Record<string, SymbolCategory> = {
	"Apps": "app",
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

export class SymbolRegistry extends Map<string, SymbolEntry> {
	constructor() {
		super();
		this.init();
	}

	private init() {
		const referenceDirectory = fileURLToPath(new URL("../../src/reference", import.meta.url));
		if (!existsSync(referenceDirectory))
			return;

		const collisions: Collision[] = [];
		for (const packageName of PACKAGE_PATHS) {
			this.loadPackage(packageName, collisions);
		}

		this.set("prozilla-os", {
			path: "prozilla-os",
			packageName: "prozilla-os",
			type: "package",
			href: SymbolRegistry.indexUrl("prozilla-os"),
		});

		this.logCollisions(collisions);
	}

	private readNavigation(packageName: string) {
		const navPath = fileURLToPath(new URL(`../../src/reference/${packageName}/nav.json`, import.meta.url));
		if (!existsSync(navPath))
			return;

		try {
			const content = readFileSync(navPath, "utf-8");
			const navigation = JSON.parse(content) as NavigationJSON;
			return Array.isArray(navigation) ? navigation : undefined;
		} catch (error) {
			logger.warn(`Failed to read nav.json for ${packageName}:`, (error as Error).message);
		}
	}

	private loadPackage(packageName: string, collisions: Collision[]) {
		const navigation = this.readNavigation(packageName);
		if (!navigation)
			return;

		this.set(packagePathToId(packageName), {
			path: packageName,
			packageName,
			type: "package",
			href: SymbolRegistry.indexUrl(packageName),
		});

		const seen = new Set<string>();
		for (const group of navigation) {
			const children = group.children;
			if (!Array.isArray(children))
				continue;

			const type = GROUP_TO_TYPE[group.title];

			for (const child of children) {
				if (!child.title || !child.path)
					continue;

				const cleanPath = child.path.replace(/\.md$/, "");
				const key = child.title + "@" + packageName;
				if (seen.has(key))
					continue;

				seen.add(key);

				const existingEntry = this.get(child.title);
				if (existingEntry) {
					collisions.push({
						symbol: child.title,
						kept: existingEntry.packageName,
						skipped: packageName,
					});
					continue;
				}

				const childPath = packageName + "/" + cleanPath;
				this.set(child.title, {
					path: childPath,
					packageName,
					type,
					href: SymbolRegistry.referenceUrl(childPath),
				});
			}
		}
	}

	private logCollisions(collisions: Collision[]) {
		for (const { symbol, kept, skipped } of collisions) {
			logger.warn(
				`Collision: ${symbol} is exported from ${kept} and ${skipped}.`,
				`Defaulting to ${kept}, write ${packagePathToId(skipped)}#${symbol} to use ${skipped} instead.`
			);
		}
	}

	resolveSymbol(name: string, category?: SymbolCategory) {
		const found = this.get(name);
		if (found && (!category || found.type === category))
			return found;
	}

	static referenceUrl(path: string) {
		return resolveUrl("/reference", path);
	}

	static indexUrl(path: string) {
		return this.referenceUrl(path) + "/";
	}
}
