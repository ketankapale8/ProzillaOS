import type MarkdownIt from "markdown-it";

/**
 * MarkdownIt plugin that adds file titles to code blocks when the first line contains a comment with a file path.
 */
export function codeBlockTitlePlugin(markdownIt: MarkdownIt) {
	markdownIt.core.ruler.push("code_block_title", (state) => {
		const tokens = state.tokens;

		for (const token of tokens) {
			if (token.type !== "fence")
				continue;

			const info = token.info;
			const language = info.split(/\s+/)[0];
			const rest = info.slice(language.length).trim();
			if (rest && !rest.startsWith("{"))
				continue;

			const content = token.content;
			const firstLineEnd = content.indexOf("\n");
			const rawFirstLine = firstLineEnd >= 0 ? content.slice(0, firstLineEnd) : content;
			const trimmedFirstLine = rawFirstLine.trim();
			if (!trimmedFirstLine)
				continue;

			const match = trimmedFirstLine.match(/^\/\/\s*(.+)$/);
			if (!match)
				continue;

			const filePath = match[1].trim();
			if (!filePath)
				continue;

			const extensionIndex = filePath.lastIndexOf(".");
			if (extensionIndex < 0)
				continue;

			const extension = filePath.slice(extensionIndex + 1);
			if (extension !== language)
				continue;

			token.info = `${language} [${filePath}]${rest ? " " + rest : ""}`;
			token.content = firstLineEnd >= 0 ? content.slice(firstLineEnd + 1) : "";
		}
	});
}
