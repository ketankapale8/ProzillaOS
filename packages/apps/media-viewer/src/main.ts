import { App, AppsConfig, MEDIA_EXTENSIONS } from "@prozilla-os/core";
import { MediaViewer, type MediaViewerProps } from "./components/MediaViewer";
import { Skin, MacOsSkin, Windows95Skin, MinimalSkin, PixelSkin } from "@prozilla-os/skins";

const mediaViewer = new App<MediaViewerProps>("Media Viewer", "media-viewer", MediaViewer)
	.setIconUrl("https://os.prozilla.dev/assets/apps/icons/media-viewer.svg")
	.setRole(AppsConfig.APP_ROLES.mediaViewer)
	.setAssociatedExtensions(MEDIA_EXTENSIONS)
	.setCategory("Photo & video")
	.addSkinOverride(MacOsSkin, { 
		name: "Photos", 
		iconUrl: Skin.assetUrl("/assets/skins/mac/apps/icons/media-viewer.svg"),
	})
	.addSkinOverride(Windows95Skin, { 
		name: "Imaging", 
		iconUrl: Skin.assetUrl("/assets/skins/windows95/apps/icons/media-viewer.svg"),
	})
	.addSkinOverride(MinimalSkin, { 
		iconUrl: Skin.assetUrl("/assets/skins/minimal/apps/icons/media-viewer.svg"),
	})
	.addSkinOverride(PixelSkin, { 
		iconUrl: Skin.assetUrl("/assets/skins/pixel/apps/icons/media-viewer.png"),
	});

export { mediaViewer, MediaViewerProps };