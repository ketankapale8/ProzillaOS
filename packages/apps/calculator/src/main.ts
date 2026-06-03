import { App } from "@prozilla-os/core";
import { Calculator } from "./components/Calculator";
import { Vector2 } from "@prozilla-os/shared";
import { Skin, MacOsSkin, Windows95Skin, MinimalSkin, PixelSkin } from "@prozilla-os/skins";

const calculator = new App("Calculator", "calculator", Calculator, { size: new Vector2(400, 600) })
	.setIconUrl("https://os.prozilla.dev/assets/apps/icons/calculator.svg")
	.setPinnedByDefault(false)
	.setCategory("Utilities & tools")
	.addSkinOverride(MacOsSkin, { 
		name: "Calculator", 
		iconUrl: Skin.assetUrl("/assets/skins/mac/apps/icons/calculator.svg"),
	})
	.addSkinOverride(Windows95Skin, { 
		name: "Calculator", 
		iconUrl: Skin.assetUrl("/assets/skins/windows95/apps/icons/calculator.svg"),
	})
	.addSkinOverride(MinimalSkin, { 
		iconUrl: Skin.assetUrl("/assets/skins/minimal/apps/icons/calculator.svg"),
	})
	.addSkinOverride(PixelSkin, { 
		iconUrl: Skin.assetUrl("/assets/skins/pixel/apps/icons/calculator.png"),
	});

export { calculator };