import { extend } from "@prozilla-os/dev-tools";
import { describe, test as base, expect } from "vitest";
import { Skin } from "../../src/core";

const test = extend(base);

const DEFAULT_BASE_URL = "https://os.prozilla.dev/";

describe("Skin", () => {
	test.simpleCases(Skin.assetUrl, [
		["/asset/test.svg", "{base}/asset/test.svg"],
		["asset/test.svg", "{base}asset/test.svg"],
		["https://os.prozilla.dev/asset/test.svg", "https://os.prozilla.dev/asset/test.svg"],
	]);

	test("with default options has default base URL", () => {
		const skin = new Skin();
		expect(skin.baseUrl).toBe(DEFAULT_BASE_URL);
	});

	describe(`with default options resolves assets to ${DEFAULT_BASE_URL}`, () => {
		const skin = new Skin();

		test.each([
			...skin.wallpapers,
			skin.defaultWallpaper,
			skin.systemIcon,
			...Object.values(skin.fileIcons),
			...Object.values(skin.folderIcons),
		])(`%s starts with ${DEFAULT_BASE_URL}`, (assetUrl) => {
			expect(assetUrl.startsWith(DEFAULT_BASE_URL)).toBe(true);
		});
	});

	describe("resolves assets with custom base URL", () => {
		const baseUrl = "https://example.com/";
		const skin = new Skin({ baseUrl });

		test.each([
			...skin.wallpapers,
			skin.defaultWallpaper,
			skin.systemIcon,
			...Object.values(skin.fileIcons),
			...Object.values(skin.folderIcons),
		])(`%s starts with ${baseUrl}`, (assetUrl) => {
			expect(assetUrl.startsWith(baseUrl)).toBe(true);
		});
	});

	describe("resolves assets without base URL ending in '/'", () => {
		const baseUrl = "https://example.com/";
		const skin = new Skin({
			baseUrl: baseUrl.slice(0, -1),
			systemIcon: "{base}assets/system-icon.svg",
		});

		test.each([
			...skin.wallpapers,
			skin.defaultWallpaper,
			skin.systemIcon,
			...Object.values(skin.fileIcons),
			...Object.values(skin.folderIcons),
		])(`%s starts with ${baseUrl}`, (assetUrl) => {
			expect(assetUrl.startsWith(baseUrl)).toBe(true);
		});
	});
});