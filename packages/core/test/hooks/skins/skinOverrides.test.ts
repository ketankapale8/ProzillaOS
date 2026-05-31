import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { Skin } from "@prozilla-os/skins";
import { useSkinOverrides, useSkin } from "../../../src/hooks";

vi.mock(import("../../../src/hooks/system/systemManagerContext"), async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		useSkin: vi.fn(),
	};
});

class SkinA extends Skin {}
class SkinB extends Skin {}

const mockUseSkin = vi.mocked(useSkin);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("useSkinOverrides", () => {
	it("returns undefined when no skin matches and no default is provided", () => {
		mockUseSkin.mockReturnValue(new SkinA());

		const overrides = new Map<typeof Skin, { color: string }>([
			[SkinB, { color: "blue" }],
		]);

		const { result } = renderHook(() => useSkinOverrides(overrides));
		expect(result.current).toBeUndefined();
	});

	it("returns the default value when no skin matches", () => {
		mockUseSkin.mockReturnValue(new SkinA());

		const defaultValue = { color: "red" };
		const overrides = new Map<typeof Skin, { color: string }>([
			[SkinB, { color: "blue" }],
		]);

		const { result } = renderHook(() => useSkinOverrides(overrides, defaultValue));
		expect(result.current).toStrictEqual(defaultValue);
	});

	it("returns the merged override when the current skin matches", () => {
		const skinA = new SkinA();
		mockUseSkin.mockReturnValue(skinA);

		const defaultValue = { color: "red", size: 10 };
		const skinAOverride = { color: "green" };
		const merged = { color: "green", size: 10 };

		const overrides = new Map<typeof Skin, Partial<typeof defaultValue>>([
			[SkinA, skinAOverride],
		]);

		const { result } = renderHook(() => useSkinOverrides(overrides, defaultValue));
		expect(result.current).toStrictEqual(merged);
	});

	it("merges all matching skin overrides when multiple skins match", () => {
		class SkinAA extends SkinA {}
		const skinAA = new SkinAA();
		mockUseSkin.mockReturnValue(skinAA);

		const defaultValue = { x: 0, y: 0, skins: ["default"] };
		const overrideA = { x: 1, skins: ["A"] };
		const overrideAA = { y: 2, skins: ["AA"] };
		const merged = { x: 1, y: 2, skins: ["default", "A", "AA"] };

		const overrides = new Map<typeof Skin, Partial<typeof defaultValue>>([
			[SkinA, overrideA],
			[SkinAA, overrideAA],
		]);

		const { result } = renderHook(() => useSkinOverrides(overrides, defaultValue));
		expect(result.current).toStrictEqual(merged);
	});
});