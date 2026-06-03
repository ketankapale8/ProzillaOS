import { App, AppsConfig } from "@prozilla-os/core";
import { Settings, type SettingsProps } from "./components/Settings";
import { Skin, MacOsSkin, Windows95Skin, MinimalSkin, PixelSkin } from "@prozilla-os/skins";

const settings = new App<SettingsProps>("Settings", "settings", Settings)
	.setIconUrl("https://os.prozilla.dev/assets/apps/icons/settings.svg")
	.setRole(AppsConfig.APP_ROLES.settings)
	.setCategory("Personalization")
	.addSkinOverride(MacOsSkin, { 
		iconUrl: Skin.assetUrl("/assets/skins/mac/apps/icons/settings.svg"),
	})
	.addSkinOverride(Windows95Skin, { 
		iconUrl: Skin.assetUrl("/assets/skins/windows95/apps/icons/settings.svg"),
	})
	.addSkinOverride(MinimalSkin, { 
		iconUrl: Skin.assetUrl("/assets/skins/minimal/apps/icons/settings.svg"),
	})
	.addSkinOverride(PixelSkin, { 
		iconUrl: Skin.assetUrl("/assets/skins/pixel/apps/icons/settings.png"),
	});

export { settings, SettingsProps };