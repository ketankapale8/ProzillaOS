import type MarkdownIt from "markdown-it";
import type { SymbolCategory, SymbolEntry, SymbolRegistry } from "./symbolRegistry";

/**
 * MarkdownIt plugin that adds links to symbols in inline code.
 */
export function inlineCodeLinksPlugin(markdownIt: MarkdownIt, { registry }: { registry: SymbolRegistry }) {
	if (!registry.size)
		return;

	markdownIt.core.ruler.push("inline_code_links", (state) => {
		const tokens = state.tokens;
		let titleDepth = 0;

		for (const token of tokens) {
			if (token.type === "heading_open" && token.tag === "h1") {
				titleDepth++;
				continue;
			}

			if (token.type === "heading_close" && token.tag === "h1") {
				titleDepth--;
				continue;
			}

			if (token.type !== "inline" || !token.children?.length || titleDepth > 0)
				continue;

			const children = token.children;
			let linkDepth = 0;
			let linkOpenIndex = -1;

			for (let j = 0; j < children.length; j++) {
				const child = children[j];

				if (child.type === "link_open") {
					linkDepth++;
					linkOpenIndex = j;
					continue;
				}

				if (child.type === "link_close") {
					linkDepth--;
					continue;
				}

				if (child.type !== "code_inline")
					continue;

				const content = child.content.trim();
				if (!content)
					continue;

				if (content.startsWith("\"") && content.endsWith("\"")) {
					const existingClass = child.attrGet("class") ?? "";
					child.attrSet("class", `${existingClass} inline-string`);
					continue;
				}

				const entry = findSymbolEntry(registry, content);
				if (!entry)
					continue;

				child.content = normalizeDisplayText(content, entry.type);

				if (linkDepth > 0 && linkOpenIndex >= 0) {
					const existingClass = children[linkOpenIndex].attrGet("class") ?? "";
					children[linkOpenIndex].attrSet("data-symbol", content);
					children[linkOpenIndex].attrSet("class", `${existingClass} symbol-link inline-symbol-link ${entry.type}-symbol`.trim());
				} else {
					const openToken = new state.Token("link_open", "a", 1);
					openToken.attrSet("href", entry.href);
					openToken.attrSet("data-symbol", content);
					openToken.attrSet("class", `symbol-link inline-symbol-link ${entry.type}-symbol`);
					const closeToken = new state.Token("link_close", "a", -1);

					children.splice(j, 1, openToken, child, closeToken);
					j += 2;
				}
			}
		}
	});
}

function normalizeDisplayText(content: string, type: SymbolCategory): string {
	switch (type) {
		case "component":
			return `<${content.replace(/^<|\/?>$/g, "").trim()}/>`;
		case "function":
			return `${content.replace(/\(\)$/g, "").trim()}()`;
		default:
			return content;
	}
}

function findSymbolEntry(registry: SymbolRegistry, content: string): SymbolEntry | undefined {
	return resolveQualifiedSymbol(registry, content)
		?? registry.resolveSymbol(content)
		?? resolveComponentSymbol(registry, content)
		?? resolveFunctionSymbol(registry, content);
}

function resolveQualifiedSymbol(registry: SymbolRegistry, content: string) {
	const hashIndex = content.indexOf("#");
	if (hashIndex <= 0 || hashIndex >= content.length - 1)
		return;

	const packageId = content.slice(0, hashIndex).trim();
	const name = content.slice(hashIndex + 1).trim();

	const packageEntry = registry.get(packageId);
	if (!packageEntry)
		return;

	const symbolEntry = registry.get(name);
	if (symbolEntry && symbolEntry.packageName === packageEntry.packageName)
		return symbolEntry;
}

function resolveComponentSymbol(registry: SymbolRegistry, content: string) {
	if (!content.startsWith("<") || !content.endsWith(">"))
		return;

	const name = content.replace(/^<|\/?>$/g, "").trim();
	if (!name)
		return;

	return registry.resolveSymbol(name, "component");
}

function resolveFunctionSymbol(registry: SymbolRegistry, content: string) {
	if (!content.endsWith("()") || content.length <= 2)
		return;

	const name = content.slice(0, -2).trim();
	if (!name)
		return;

	return registry.resolveSymbol(name, "function", "hook");
}