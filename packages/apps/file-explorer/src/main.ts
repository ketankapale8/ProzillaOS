import { App, AppsConfig } from "@prozilla-os/core";
import { FileExplorer, type FileExplorerProps } from "./components/FileExplorer";
import { Skin, MacOsSkin, Windows95Skin, MinimalSkin, PixelSkin } from "@prozilla-os/skins";

const fileExplorer = new App<FileExplorerProps>("File Explorer", "file-explorer", FileExplorer)
	.setIconUrl("https://os.prozilla.dev/assets/apps/icons/file-explorer.svg")
	.setRole(AppsConfig.APP_ROLES.fileExplorer)
	.setCategory("Utilities & tools")
	.addSkinOverride(MacOsSkin, { 
		name: "Finder", 
		iconUrl: Skin.assetUrl("/assets/skins/mac/apps/icons/file-explorer.svg"),
	})
	.addSkinOverride(Windows95Skin, { 
		name: "Windows Explorer", 
		iconUrl: Skin.assetUrl("/assets/skins/windows95/apps/icons/file-explorer.svg"),
	})
	.addSkinOverride(MinimalSkin, { 
		iconUrl: Skin.assetUrl("/assets/skins/minimal/apps/icons/file-explorer.svg"),
	})
	.addSkinOverride(PixelSkin, { 
		iconUrl: Skin.assetUrl("/assets/skins/pixel/apps/icons/file-explorer.png"),
	});

export { fileExplorer, FileExplorerProps };
export { FileSelectorMode } from "./types/utils";