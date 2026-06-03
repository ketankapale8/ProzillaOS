import { interleave, replaceAll } from "./array.utils";

/**
 * Converts a string to a boolean.
 * @param input - The string to parse.
 */
export function parseBool(input: string) {
	return input.trim().toLowerCase() === "true";
}

/**
 * Converts a kebab-case string to camelCase.
 */
export function kebabToCamelCase(value: string): string {
	return value.replace(/-([a-z])/g, (_substring, letter: string) => letter.toUpperCase());
}

/**
 * Returns the longest common prefix from a list of strings.
 */
export function getLongestCommonPrefix(strings: string[]) {
	if (!strings.length) return "";
    
	let prefix = strings[0];
	for (let i = 1; i < strings.length; i++) {
		while (strings[i].indexOf(prefix) !== 0) {
			prefix = prefix.substring(0, prefix.length - 1);
			if (prefix === "") return "";
		}
	}
	return prefix;
}

/**
 * Splits a string into two strings at a given index.
 * @param string - The string to split.
 * @param index - The index to split at.
 * @returns The parts of the string before and after the character at the given index.
 */
export function splitAt(string: string, index: number): [string, string] {
	if (index < 0 || index >= string.length)
		return [string, ""];
	return [string.slice(0, index), string.slice(index + 1)];
}

export function fillTemplate(template: string, properties: Record<string, string>, options: { join: false }): string[]
export function fillTemplate(template: string, properties: Record<string, string>, options?: { join?: true | string }): string
export function fillTemplate(template: string, properties: Record<string, string>, options: { join?: boolean | string } = {}): string[] | string {
	const { join = true } = options;
	const cache: Record<string, string> = {};
	const keys = Object.keys(properties);

	function resolve(key: string): string {
		if (key in cache)
			return cache[key];
		cache[key] = `{${key}}`;
		cache[key] = expand([properties[key]]).join("");
		return cache[key];
	}

	function expand(segments: string[]): string[] {
		for (const key of keys) {
			const placeholder = `{${key}}`;

			if (!segments.some((segment) => segment.includes(placeholder)))
				continue;

			segments = replaceAll(
				segments.flatMap((segment) => isolateSubstring(segment, placeholder)),
				placeholder,
				resolve(key)
			);
		}
		return segments;
	}

	const segments = expand([template]);
	if (typeof join === "string") {
		return segments.join(join);
	} else if (join) {
		return segments.join("");
	}
	return segments;
}

/**
 * Splits a string into an array of substrings where all substrings matching {@link searchValue} are separate items.
 * @param string - The string to split.
 * @param searchValue - The value to isolate from other substrings.
 * @returns An array of substrings matching {@link searchValue} and the rest of the string.
 */
export function isolateSubstring(string: string, searchValue: string) {
	if (string === "") return [""];
	return interleave(searchValue, string.split(searchValue)).filter((item) => item.length);
}

/**
 * Transforms the first character of a string to uppercase.
 * @param string - The string to capitalize.
 * @returns The string with the first character transformed to uppercase.
 */
export function capitalize<S extends string = string>(string: S): Capitalize<S> {
	return (string.length <= 1
		? string.toUpperCase()
		: string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<S>;
}