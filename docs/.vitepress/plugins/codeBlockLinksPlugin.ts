import type { ShikiTransformer } from "@shikijs/types";
import type { SymbolRegistry } from "./symbolRegistry";
import type { ElementContent } from "hast";
import { resolveUrl } from "@prozilla-os/shared/utils";

const NAME = "code-block-links";
const LANGUAGES = ["js", "jsx", "ts", "tsx"];
const OPACITY = 0.375;

/**
 * Shiki transformer that adds links to symbols in code blocks.
 */
export function codeBlockLinksPlugin(registry: SymbolRegistry, base = ""): ShikiTransformer {
	if (!registry.size)
		return { name: NAME };

	const hexAlpha = Math.round(OPACITY * 255).toString(16).padStart(2, "0");

	return {
		name: NAME,
		line(element) {
			if (!LANGUAGES.includes(this.options.lang))
				return;

			const children = element.children;

			for (let i = children.length - 1; i >= 0; i--) {
				const child = children[i];
				if (child.type !== "element" || child.tagName !== "span")
					continue;

				const textNodes = child.children;
				if (!textNodes.length)
					continue;

				const textNode = textNodes[0];
				if (textNode.type !== "text")
					continue;

				const raw = textNode.value;
				const trimmed = raw.trim();
				if (!trimmed)
					continue;

				const entry = registry.get(trimmed);
				if (!entry?.category)
					continue;

				const trimmedStart = raw.indexOf(trimmed);
				const prefix = raw.slice(0, trimmedStart);
				const suffix = raw.slice(trimmedStart + trimmed.length);
				const properties = child.properties;

				const parts: Array<ElementContent> = [];

				if (prefix) {
					parts.push({
						type: "element",
						tagName: "span",
						properties,
						children: [{ type: "text", value: prefix }],
					});
				}

				let style = `--opacity: ${OPACITY};`;
				if (typeof properties.style === "string")
					style += properties.style.replace(/(#[0-9a-fA-F]{6})\b/g, (hex) => hex + hexAlpha);

				parts.push({
					type: "element",
					tagName: "a",
					properties: {
						href: resolveUrl(base, entry.href),
						class: "symbol-link",
						"data-symbol": trimmed,
						style,
					},
					children: [{
						type: "element",
						tagName: "span",
						properties,
						children: [{ type: "text", value: trimmed }],
					}],
				});

				if (suffix) {
					parts.push({
						type: "element",
						tagName: "span",
						properties,
						children: [{ type: "text", value: suffix }],
					});
				}

				children.splice(i, 1, ...parts);
			}
		},
	};
}