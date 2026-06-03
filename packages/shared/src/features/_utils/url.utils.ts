import { splitAt } from "./string.utils";

/**
 * Removes the URL protocol from a URL string.
 * @param url - The URL string.
 * @returns The URL string without its protocol.
 * @example
 * removeUrlProtocol("https://example.com/foo/bar") === "example.com/foo/bar"
 */
export function removeUrlProtocol(url: string) {
	return url.replace(/^https?:\/\/|\/$/g, "");
}

/**
 * Removes the origin/base from a URL string.
 * @param url - The URL string.
 * @returns The URL string without its origin.
 * @example
 * removeBaseUrl("https://example.com/foo/bar") === "/foo/bar"
 */
export function removeBaseUrl(url: string) {
	return url.replace(/^https?:\/\/[a-z]+(\.[0-9a-z-]+)+/g, "");
}

/**
 * Checks whether a string is a valid URL.
 * @param string - The string to check.
 * @returns `true` if {@link string} is a URL.
 */
export function isValidUrl(string: string) {
	try {
		new URL(string);
		return true;
	} catch (_error) {
		return false;
	}
}

/**
 * Combines an array of URL segments into a URL string.
 * @param segments - The segments of the URL.
 * @returns The combined URL.
 */
export function resolveUrl(...segments: string[]) {
	let path = "";
	const parameters = new Map<string, string>();

	for (const segment of segments) {
		const [pathSegment, parametersSegment] = splitAt(segment, segment.indexOf("?"));

		if (pathSegment.length) {
			if (!path.length) {
				path += pathSegment;
			} else if (path.endsWith("/")) {
				path += pathSegment.replace(/^\//, "");
			} else {
				if (!pathSegment.startsWith("/"))
					path += "/";
				path += pathSegment;
			}
		}

		if (parametersSegment.length) {
			for (const parameter of parametersSegment.split(/[?&]/)) {
				const [key, value] = splitAt(parameter, parameter.indexOf("="));
				parameters.set(key, value);
			}
		}
	}

	if (parameters.size)
		path += "?" + parameters.entries().map(([key, value]) => `${key}=${value}`).toArray().join("&");
	return path;
}