import { Skin, SkinOptions } from "../skin";

/**
 * A skin inspired by the MacOS interface.
 */
export class MacOsSkin extends Skin {
	public static override DEFAULTS: SkinOptions = {
		...super.DEFAULTS,
		wallpapers: [
			Skin.assetUrl("/assets/skins/mac/wallpapers/macos-monterey.jpg"),
			Skin.assetUrl("/assets/skins/mac/wallpapers/macos-big-sur.jpg"),
			Skin.assetUrl("/assets/skins/mac/wallpapers/macos-sequoia.jpg"),
			Skin.assetUrl("/assets/skins/mac/wallpapers/macos-sonoma.jpg"),
			Skin.assetUrl("/assets/skins/mac/wallpapers/macos-ventura.jpg"),
		],
		defaultWallpaper: Skin.assetUrl("/assets/skins/mac/wallpapers/macos-monterey.jpg"),
		fileIcons: {
			generic: Skin.assetUrl("/assets/skins/mac/apps/file-explorer/file.svg"),
		},
		folderIcons: {
			generic: Skin.assetUrl("/assets/skins/mac/apps/file-explorer/folder.svg"),
		},
		loadStyleSheet: () => {
			void import("../../styles/skins/macOs.css");
		},
	};
}

export const macOsSkin = new MacOsSkin();