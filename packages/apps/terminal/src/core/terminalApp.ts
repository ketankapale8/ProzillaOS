import { App, AppsConfig, Command, ExecutableResolver } from "@prozilla-os/core";
import { Terminal, TerminalProps } from "../components/Terminal";
import { Skin, MacOsSkin, Windows95Skin, MinimalSkin, PixelSkin } from "@prozilla-os/skins";

export class TerminalApp extends App<TerminalProps> {

	constructor() {
		super("Terminal", "terminal", Terminal);
		this.setIconUrl("https://os.prozilla.dev/assets/apps/icons/terminal.svg");
		this.setRole(AppsConfig.APP_ROLES.terminal);
		this.setCategory("Utilities & tools");
		this.addSkinOverride(MacOsSkin, { 
			name: "Terminal", 
			iconUrl: Skin.assetUrl("/assets/skins/mac/apps/icons/terminal.svg"),
		});
		this.addSkinOverride(Windows95Skin, { 
			name: "MS-DOS Prompt", 
			iconUrl: Skin.assetUrl("/assets/skins/windows95/apps/icons/terminal.svg"),
		});
		this.addSkinOverride(MinimalSkin, { 
			iconUrl: Skin.assetUrl("/assets/skins/minimal/apps/icons/terminal.svg"),
		});
		this.addSkinOverride(PixelSkin, { 
			iconUrl: Skin.assetUrl("/assets/skins/pixel/apps/icons/terminal.png"),
		});
	}

	addCommands(commands: Command[]) {
		commands.forEach((command) => this.addCommand(command));
		return this;
	}


	addCommand(command: Command) {
		ExecutableResolver.builtins.push(command);
		return this;
	}

}