import { Theme } from "../../types";
import { Skin, SkinOptions } from "../skin";

/**
 * A skin inspired by the Windows95 interface.
 */
export class Windows95Skin extends Skin {
	public static override DEFAULTS: SkinOptions = {
		...super.DEFAULTS,
		systemIcon: Skin.assetUrl("/assets/skins/windows95/system-icon.png"),
		wallpapers: [
			Skin.assetUrl("/assets/skins/windows95/wallpapers/default.png"),
			Skin.assetUrl("/assets/skins/windows95/wallpapers/clouds.png"),
		],
		defaultWallpaper: Skin.assetUrl("/assets/skins/windows95/wallpapers/default.png"),
		fileIcons: {
			generic: Skin.assetUrl("/assets/skins/windows95/apps/file-explorer/file.svg"),
		},
		folderIcons: {
			generic: Skin.assetUrl("/assets/skins/windows95/apps/file-explorer/folder.svg"),
		},
		defaultTheme: Theme.Light,
		loadStyleSheet: () => {
			void import("../../styles/skins/windows95.css");
		},
	};
}

export const windows95Skin = new Windows95Skin();