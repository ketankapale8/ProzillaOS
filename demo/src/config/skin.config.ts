import { Skin } from "@prozilla-os/skins";

const defaultSkin = new Skin({
	baseUrl: "/",
	defaultWallpaper: Skin.assetUrl("/assets/wallpapers/abstract-mesh-gradient-orange-red-purple.png"),
});

export { defaultSkin };