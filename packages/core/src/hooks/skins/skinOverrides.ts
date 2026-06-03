import { Skin } from "@prozilla-os/skins";
import { useSkin } from "../system/systemManagerContext";
import { useMemo } from "react";
import { mergeDeep, MergeValues } from "@prozilla-os/shared";

/**
 * Computes the override for the current skin.
 * 
 * For each entry, if the key is (a subclass of) the current type of skin, the override is applied.
 * If multiple entries match the current skin, they are merged.
 * 
 * @param overrides - The overrides to check.
 * @typeParam Override - The type of override.
 * @returns All matching overrides merged, or `undefined` if none match.
 * @see {@link useSkin}
 */
export function useSkinOverrides<Override>(overrides: Map<typeof Skin, Override>): Override | undefined;
/**
 * Computes the override for the current skin.
 * 
 * For each entry, if the key is (a subclass of) the current type of skin, the override is applied.
 * If one or more entries match the current skin, they are all merged with the default value.
 * 
 * @param overrides - The overrides to check.
 * @param defaultValue - The default value to merge the matching overrides with.
 * @typeParam Default - The type of the default value.
 * @typeParam Override - The type of override.
 * @returns The default value, merged with all overrides that match.
 * @see {@link useSkin}
 */
export function useSkinOverrides<Default, Override = undefined>(overrides: Map<typeof Skin, Override>, defaultValue: Default): Default | MergeValues<Default, Override>;
export function useSkinOverrides<Default, Override>(overrides: Map<typeof Skin, Override>, defaultValue?: Default): Default | Override | MergeValues<Default, Override> | undefined {
	const skin = useSkin();
	const override = useMemo(() => {
		const entries = Array.from(overrides.entries());
		const matching = entries.filter(([key]) => skin instanceof key);
		if (matching.length === 0)
			return defaultValue;
		const sources = matching.map(([, value]) => ({ override: value }));
		return mergeDeep({ override: defaultValue }, ...sources).override;
	}, [skin, overrides, defaultValue]);
	return override;
}