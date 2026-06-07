---
outline: deep
description: "Learn how to create custom skins to change the look and feel of ProzillaOS"
---

# Style overrides

Skins change the appearance of ProzillaOS, including wallpapers, icons, colors, fonts, and stylesheets.
You can use a built-in skin or create a custom one with the `Skin` class.

## Prerequisites

This guide assumes you have a basic ProzillaOS project set up. See the [Getting started guide](./getting-started) for more information.

## Using built-in skins

`@prozilla-os/skins` includes several ready-to-use skins. Import the skin you want to use and pass it to the `skin` prop of `<ProzillaOS/>`:

```tsx
import { ProzillaOS } from "prozilla-os";
import { macOsSkin } from "@prozilla-os/skins";

function MyComponent() {
	return <ProzillaOS skin={macOsSkin}>
		{/* ... */}
	</ProzillaOS>;
}
```

Refer to the [Skins](../about/skins) page for an overview of all built-in skins with screenshots.

## Creating a custom skin

Create a new `Skin` instance with the options you want to override. Any options that are not set will use default values.

```ts
import { Skin } from "@prozilla-os/skins";

const mySkin = new Skin({
	wallpapers: [
		"/assets/my-wallpapers/custom-1.png",
		"/assets/my-wallpapers/custom-2.png",
	],
	defaultWallpaper: "/assets/my-wallpapers/custom-1.png",
});
```

::: tip

You can replace `Skin` with any of its subclasses. For example, you can create a custom skin based on the built-in Windows 95 skin like this:

```ts
import { Windows95Skin } from "@prozilla-os/skins";

const mySkin = new Windows95Skin({
	wallpapers: [
		"/assets/my-wallpapers/custom-1.png",
		"/assets/my-wallpapers/custom-2.png",
	],
	defaultWallpaper: "/assets/my-wallpapers/custom-1.png",
});
```

:::

Using your custom skin works in the same way as using a built-in skin. You simply pass it to the `<ProzillaOS/>` component.

## Customizing icons

You can override app icons and display names with your skin. The keys here represent app IDs:

```ts
const mySkin = new Skin({
	appIcons: {
		"file-explorer": "/assets/icons/my-folder.svg",
		"text-editor": "/assets/icons/my-editor.svg",
	},
	appNames: {
		"file-explorer": "Browse",
	},
});
```

File and folder type icons can also be customized:

```ts
const mySkin = new Skin({
	fileIcons: {
		generic: "/assets/icons/file.svg",
		text: "/assets/icons/file-text.svg",
		code: "/assets/icons/file-code.svg",
	},
	folderIcons: {
		generic: "/assets/icons/folder.svg",
		images: "/assets/icons/folder-images.svg",
	},
});
```

## Custom CSS

Provide a `loadStyleSheet` callback to dynamically load a CSS file for your skin:

```ts
const mySkin = new Skin({
	loadStyleSheet: () => {
		void import("./my-skin.css");
	},
});
```

## Theme

The `Theme` enum specifies which color scheme the skin starts with:

```ts
import { Skin, Theme } from "@prozilla-os/skins";

const mySkin = new Skin({
	defaultTheme: Theme.Light,
});
```

## Advanced usage

For more control, you can extend the `Skin` class and override `DEFAULTS`:

```ts
import { Skin, type SkinOptions } from "@prozilla-os/skins";

export class RetroSkin extends Skin {
	static override DEFAULTS: SkinOptions = {
		...Skin.DEFAULTS,
		baseUrl: "/",
		wallpapers: [
			Skin.assetUrl("/assets/retro/wallpapers/retro-1.png"),
			Skin.assetUrl("/assets/retro/wallpapers/retro-2.png"),
		],
		defaultWallpaper: Skin.assetUrl("/assets/retro/wallpapers/retro-1.png"),
		loadStyleSheet: () => {
			void import("./retro-skin.css");
		},
	};
}

export const retroSkin = new RetroSkin();
```

::: tip

`Skin.assetUrl()` prepends a `{base}` placeholder that is replaced with `skin.baseUrl` at runtime.
The default value of `skin.baseUrl` is `"https://os.prozilla.dev/"`, it is recommended to change this to `"/"` or your own URL if you are using custom assets.

If you are using both custom assets and official assets, it might be simpler to omit `Skin.assetUrl()` and leave `skin.baseUrl` as its default value, so the official assets resolve correctly.

:::

## Skins for apps

Apps can dynamically change their data based on the current skin with the `addSkinOverride()` method:

```ts
import { App } from "prozilla-os";
import { MacOsSkin, Windows95Skin } from "@prozilla-os/skins";

const myApp = new App("My App", "my-app", MyComponent)
	.addSkinOverride(MacOsSkin, {
		name: "My macOS App",
	})
	.addSkinOverride(Windows95Skin, {
		name: "My Windows 95 App",
	});
```

Components (e.g., parts of the interface of an application) can also adapt to the current skin with the `useSkinOverrides()` hook:

```tsx
import { useSkinOverrides, MacOsSkin, Windows95Skin } from "@prozilla-os/skins";

const overrides = new Map([
	[MacOsSkin, { name: "macOS", developer: "Apple" }],
	[Windows95Skin, { name: "Windows", developer: "Microsoft" }],
]);

const default = {
	name: "ProzillaOS",
	developer: "Prozilla",
};

function MyComponent() {
	const os = useSkinOverrides(overrides, default);

	return <div>
		<h2>Info</h2>
		<p>{os.name} is an operating system made by {os.developer}</p>
	</div>;
}
```
