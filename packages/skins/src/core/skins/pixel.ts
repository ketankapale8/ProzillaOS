import { Skin, SkinOptions } from "../skin";

export class PixelSkin extends Skin {
	public static override DEFAULTS: SkinOptions = {
		...super.DEFAULTS,
		wallpapers: [
			Skin.assetUrl("/assets/skins/pixel/wallpapers/vibrant-wallpaper-blue-purple-red.png"),
			Skin.assetUrl("/assets/skins/pixel/wallpapers/abstract-mesh-gradient-orange-red-purple.png"),
			Skin.assetUrl("/assets/skins/pixel/wallpapers/vibrant-wallpaper-purple-yellow.png"),
			Skin.assetUrl("/assets/skins/pixel/wallpapers/abstract-wallpaper-mesh-gradient-cyan.png"),
			Skin.assetUrl("/assets/skins/pixel/wallpapers/colorful-abstract-wallpaper-blue-red-green.png"),
			Skin.assetUrl("/assets/skins/pixel/wallpapers/mesh-gradient-wallpaper-red-purple.png"),
			Skin.assetUrl("/assets/skins/pixel/wallpapers/colorful-mesh-gradient-red-green.png"),
			Skin.assetUrl("/assets/skins/pixel/wallpapers/flame-abstract-wallpaper-orange.png"),
			Skin.assetUrl("/assets/skins/pixel/wallpapers/wave-abstract-wallpaper-teal.png"),
		],
		defaultWallpaper: Skin.assetUrl("/assets/skins/pixel/wallpapers/vibrant-wallpaper-blue-purple-red.png"),
		fileIcons: {
			generic: Skin.assetUrl("/assets/skins/pixel/apps/file-explorer/file.png"),
		},
		folderIcons: {
			generic: Skin.assetUrl("/assets/skins/pixel/apps/file-explorer/folder.png"),
		},
		loadStyleSheet: () => {
			void import("../../styles/skins/pixel.css");
		},
	};
}

export const pixelSkin = new PixelSkin();