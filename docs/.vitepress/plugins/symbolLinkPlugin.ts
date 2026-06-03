import type MarkdownIt from "markdown-it";
import type { Registry, SymbolCategory } from "./symbolRegistry";
import { PACKAGE_PATHS } from "../packages.config";
import { resolveUrl } from "@prozilla-os/shared/utils";

function getLink(targetPath: string, isIndex: boolean) {
	const href = resolveUrl("/reference", targetPath);
	return isIndex ? href + "/" : href;
}

function findSymbolEntry(registry: Registry, content: string) {
	return resolveSymbol(registry, content)
		?? resolveComponentSymbol(registry, content)
		?? resolveFunctionSymbol(registry, content);
}

function resolveComponentSymbol(registry: Registry, content: string) {
	if (!content.startsWith("<") || !content.endsWith(">"))
		return;

	const name = content.replace(/^<|\/?>$/g, "").trim();
	if (name.length === 0)
		return;

	return resolveSymbol(registry, name, "component");
}

function resolveFunctionSymbol(registry: Registry, content: string) {
	if (!content.endsWith("()") || content.length <= 2)
		return;

	const name = content.slice(0, -2).trim();
	if (name.length === 0)
		return;

	return resolveSymbol(registry, name, "function");
}

function resolveSymbol(registry: Registry, name: string, category?: SymbolCategory) {
	let packageName: string | undefined = undefined;

	const hashIndex = name.indexOf("#");
	if (hashIndex > 0 && hashIndex < name.length - 1) {
		name = name.slice(hashIndex + 1).trim();

		const packageId = name.slice(0, hashIndex).trim();
		const packageEntry = registry.get(packageId);
		if (packageEntry)
			packageName = packageEntry.packageName;
	}

	const found = registry.get(name);
	if (found && (!packageName || found.packageName === packageName) && (!category || found.category === category))
		return found;
}

export function symbolLinkPlugin(markdownIt: MarkdownIt, options: { registry: Registry }) {
	const { registry } = options;

	if (registry.size === 0)
		return;

	markdownIt.core.ruler.push("symbol_links", (state) => {
		const tokens = state.tokens;
		let titleDepth = 0;

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];

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

			for (let j = 0; j < children.length; j++) {
				const child = children[j];

				if (child.type === "link_open") {
					linkDepth++;
					continue;
				}

				if (child.type === "link_close") {
					linkDepth--;
					continue;
				}

				if (child.type !== "code_inline" || linkDepth > 0)
					continue;

				const content = child.content.trim();
				if (!content.length)
					continue;

				const symbolEntry = findSymbolEntry(registry, content);

				if (!symbolEntry)
					continue;

				const href = getLink(symbolEntry.path, [...PACKAGE_PATHS, "prozilla-os"].includes(symbolEntry.path));

				const openToken = new state.Token("link_open", "a", 1);
				openToken.attrSet("href", href);
				openToken.attrSet("data-symbol", content);

				const closeToken = new state.Token("link_close", "a", -1);

				children.splice(j, 1, openToken, child, closeToken);
				j += 2;
			}
		}
	});
}
