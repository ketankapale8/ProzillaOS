import { Children, isValidElement, type ReactNode } from "react";

/**
 * Statically checks whether the given {@link ReactNode} contains no renderable content, without actually rendering it.
 * @param node - The node to check.
 * @returns `true` if there is no renderable child.
 */
export function isEmpty(node: ReactNode) {
	if (node == null || typeof node === "boolean")
		return true;

	if (typeof node === "string")
		return !node;

	if (typeof node === "number" || isValidElement(node))
		return false;

	let hasContent = false;
	Children.forEach(node, (child) => {
		if (hasContent)
			return;

		if (!isEmpty(child))
			hasContent = true;
	});
	return !hasContent;
}
