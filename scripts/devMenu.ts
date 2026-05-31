import { spawn } from "node:child_process";
import { interactiveListPrompt } from "../packages/dev-tools/src/features";
import { Logger } from "../packages/shared/src/features";
import { ANSI_LOGO_COLOR, ASCII_LOGO } from "../packages/core/src/constants";
import { ANSI } from "../packages/shared/src/constants";

const logger = new Logger();

async function main() {
	logger.text(ANSI_LOGO_COLOR + ASCII_LOGO + ANSI.reset);

	const answer = await interactiveListPrompt({
		message: "Select a task to run:",
		choices: [
			{ name: "Start demo", value: "demo:start", key: "s" },
			{ name: "Start docs", value: "docs:start", key: "d" },
			{ name: "Run tests", value: "test", key: "t" },
			{ name: "None", value: "", key: "n" },
		],
	});

	if (!answer.length)
		return;

	const child = spawn(`pnpm run ${answer}`, { stdio: "inherit", shell: true });
	child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((error) => {
	logger.error(error);
	process.exit(1);
});
