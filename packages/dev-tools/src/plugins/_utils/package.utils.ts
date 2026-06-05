import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isObject } from "@prozilla-os/shared/utils";

export const PROZILLA_OS_SCOPE = "@prozilla-os/";
export const ALWAYS_SHARED_SPECIFIERS = new Set(["react", "react-dom", "react/jsx-runtime"]);

export interface PackageJson {
	dependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	exports?: unknown;
	module?: string;
	main?: string;
}

export function readPackageJson(directory: string): PackageJson | null {
	try {
		const content = readFileSync(resolve(directory, "package.json"), "utf-8");
		const parsed: unknown = JSON.parse(content);

		if (!isObject(parsed))
			return null;

		const result: PackageJson = {};
		if (isStringRecord(parsed.dependencies))
			result.dependencies = parsed.dependencies;
		if (isStringRecord(parsed.peerDependencies))
			result.peerDependencies = parsed.peerDependencies;

		result.exports = parsed.exports;
		result.module = typeof parsed.module === "string" ? parsed.module : undefined;
		result.main = typeof parsed.main === "string" ? parsed.main : undefined;

		return result;
	} catch {
		return null;
	}
}

function isStringRecord(value: unknown): value is Record<string, string> {
	return isObject(value)
		&& Object.values(value).every((value) => typeof value === "string");
}

export function collectDependencyNames(packageJson: PackageJson) {
	return [
		...Object.keys(packageJson.dependencies ?? {}),
		...Object.keys(packageJson.peerDependencies ?? {}),
	];
}

export function discoverSharedSpecifiers(projectRoot: string) {
	const projectPackage = readPackageJson(projectRoot);
	if (projectPackage == null)
		return [];

	const allDependencyNames = collectDependencyNames(projectPackage);
	const specifiers = new Set(ALWAYS_SHARED_SPECIFIERS);

	for (const dependencyName of allDependencyNames) {
		if (dependencyName.startsWith(PROZILLA_OS_SCOPE))
			specifiers.add(dependencyName);
	}

	return Array.from(specifiers);
}