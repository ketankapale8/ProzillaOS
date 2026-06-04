import type { ShikiTransformer, ThemedToken } from "@shikijs/types";
import type { SymbolRegistry } from "./symbolRegistry";
import type { ElementContent } from "hast";
import { resolveUrl } from "@prozilla-os/shared/utils";
import { PACKAGES } from "../packages.config";

const NAME = "code-block-links";
const LANGUAGES = ["js", "jsx", "ts", "tsx"];
const OPACITY = 0.375;

const EXCLUDED_SCOPES = [
	"keyword.",
	"punctuation.",
	"storage.",
	"entity.name.class",
	"entity.name.interface",
	"entity.name.type.alias",
	"entity.name.enum",
	"entity.name.symbol",
	"meta.var.",
	"meta.parameter.",
	"meta.object-literal.key.",
	"constant.language",
	"constant.numeric",
];

const INHERITED_EXCLUDED_SCOPES = [
	"comment.",
	"string.",
];

/**
 * Shiki transformer that adds links to symbols in code blocks.
 */
export function codeBlockLinksPlugin(registry: SymbolRegistry, base = ""): ShikiTransformer {
	if (!registry.size)
		return { name: NAME };

	const hexAlpha = Math.round(OPACITY * 255).toString(16).padStart(2, "0");
	const excludedContent = new Set<string>();

	return {
		name: NAME,
		preprocess() {
			this.options.includeExplanation = "scopeName";
			excludedContent.clear();
		},
		tokens(tokens) {
			const importMap = buildImportMap(tokens);

			for (const [symbol, source] of importMap) {
				const entry = registry.get(symbol);
				if (!entry)
					continue;

				const expectedPath = importSourceToPackagePath(source);
				if (expectedPath && entry.packageName !== expectedPath)
					excludedContent.add(symbol);
			}

			for (const line of tokens) {
				for (const token of line) {
					if (!token.explanation)
						continue;

					const scopes = token.explanation.flatMap((explanation) =>
						explanation.scopes.map((scope) => scope.scopeName)
					);

					if (scopes[0] && isExcludedByScope(scopes))
						excludedContent.add(token.content.trim());
				}
			}
		},
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
				if (!trimmed || excludedContent.has(trimmed))
					continue;

				const entry = registry.get(trimmed);
				if (!entry || entry.type === "package")
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

function buildImportMap(tokens: ThemedToken[][]) {
	const importMap = new Map<string, string>();

	for (const line of tokens) {
		let source = "";
		const identifiers: string[] = [];

		for (const token of line) {
			if (!token.explanation)
				continue;

			const scopes = token.explanation.flatMap((entry) =>
				entry.scopes.map((scope) => scope.scopeName)
			);

			const isInImport = scopes.some((scope) => scope.startsWith("meta.import."));
			if (!isInImport)
				continue;

			const isStringLiteral = scopes.some((scope) => scope.startsWith("string.quoted."));
			if (isStringLiteral) {
				source = token.content.replace(/["']/g, "").trim();
				continue;
			}

			const isIdentifier = scopes.some((scope) =>
				scope.startsWith("entity.name.") || scope.startsWith("variable.other.")
			);
			if (isIdentifier)
				identifiers.push(token.content.trim());
		}

		if (source) {
			for (const identifier of identifiers) {
				if (!importMap.has(identifier))
					importMap.set(identifier, source);
			}
		}
	}

	return importMap;
}

function importSourceToPackagePath(source: string) {
	const matched = PACKAGES.find(
		(packageData) => source === packageData.text || source.startsWith(packageData.text + "/")
	);
	return matched?.text;
}

function isExcludedByScope(scopes: string[]) {
	const primaryScope = scopes[0];

	if (EXCLUDED_SCOPES.some((prefix) => primaryScope.startsWith(prefix)))
		return true;

	if (INHERITED_EXCLUDED_SCOPES.some((prefix) => scopes.some((scope) => scope.startsWith(prefix))))
		return true;

	if (scopes.some((scope) => scope.startsWith("entity.name.function"))) {
		return !scopes.some((scope) => scope.startsWith("meta.function-call"));
	}

	return false;
}
