---
outline: deep
description: "Learn how to get started with ProzillaOS"
image: "https://os.prozilla.dev/docs/thumbnails/getting-started-guide-thumbnail.png"
---

# Getting started

## Prerequisites

This guide assumes you have already set up a basic React project with TypeScript. To learn more about how to set up a React project, check out the official [React documentation](https://react.dev/learn/start-a-new-react-project). The React documentation also has a guide on [how to start using TypeScript in your React project](https://react.dev/learn/typescript).

## Installation

There are multiple ways to install ProzillaOS. The simplest way is to install the bundle package `prozilla-os`, which probably contains everything you will need.

::: code-group

```bash [npm]
npm install prozilla-os
```

```bash [Yarn]
yarn add prozilla-os
```

```bash [PNPM]
pnpm add prozilla-os
```

```bash [Bun]
bun add prozilla-os
```

:::

Alternatively, you can install just the `@prozilla-os/core` package, which only contains the core functionality, and install the apps you want to use separately, or create your own.

::: code-group

```bash [npm]
npm install @prozilla-os/core
```

```bash [Yarn]
yarn add @prozilla-os/core
```

```bash [PNPM]
pnpm add @prozilla-os/core
```

```bash [Bun]
bun add @prozilla-os/core
```

:::

::: warning

Most guides will assume you are using the bundle. If you are not, remember to adapt the import statements to your own setup.

:::

For an overview of all available packages, refer to the [Packages](../reference/packages) page.

### Installing apps

Install apps by running the command below. Replace `[APP]` with the id of the app you want to install (e.g., `@prozilla-os/terminal` or `@prozilla-os/file-explorer`).

::: code-group

```bash [npm]
npm install @prozilla-os/[APP]
```

```bash [Yarn]
yarn add @prozilla-os/[APP]
```

```bash [PNPM]
pnpm add @prozilla-os/[APP]
```

```bash [Bun]
bun add @prozilla-os/[APP]
```

:::

This just adds the app to your dependencies, [later in this guide](#using-apps) we will see how to actually "install" it into ProzillaOS.

## Usage

Create a component that renders ProzillaOS like this:

```tsx
// MyComponent.tsx

import { Desktop, ModalsView, ProzillaOS, Taskbar, WindowsView } from "prozilla-os";

function MyComponent() {
	return <ProzillaOS
		systemName={"Example"}
		tagLine={"Powered by ProzillaOS"}
		config={{
			// Configurations go here
		}}
	>
		<Taskbar/>
		<WindowsView/>
		<ModalsView/>
		<Desktop/>
	</ProzillaOS>;
}
```

Replace `"Example"` with a system name of your choosing and `"Powered by ProzillaOS"` by your tag line/short description.

If you don't want a taskbar/desktop/modal in your project, you can leave those components out. Unless you don't want to be able to open applications in your project, you will need to keep the `<WindowsView>` component.

### Using apps

To start using applications in your project, use the `AppsConfig` class to add a list of apps to your configuration. Here is an example with the `fileExplorer` app:

```tsx
// MyComponent.tsx

import { ProzillaOS, AppsConfig, fileExplorer } from "prozilla-os"

function MyComponent() {
	return <ProzillaOS
		systemName={"Example"}
		tagLine={"Powered by ProzillaOS"}
		config={{
			apps: new AppsConfig({
				apps: [
					fileExplorer.setName("Files")
						.setDescription("Browse and manage your virtual files on ProzillaOS.")
						.setIconUrl("/assets/apps/icons/file-explorer.svg"),
				],
			}),
		}}
	>
		<Taskbar/>
		<WindowsView/>
		<ModalsView/>
		<Desktop/>
	</ProzillaOS>;
}
```

::: tip

Extracting your configurations to separate files is recommended to make them easier to find and adjust, and to avoid making a mess of your component.
Here is an example of what that could look like:

```ts
// config/apps.config.ts

import { AppsConfig, fileExplorer, terminal, textEditor } from "prozilla-os";

export const appsConfig = new AppsConfig({
	apps: [
		fileExplorer.setName("Files")
			.setDescription("Browse and manage your virtual files on ProzillaOS.")
			.setIconUrl("/assets/apps/icons/file-explorer.svg")
			.setShowDesktopIcon(true),
		terminal.setName("Commands")
			.setDescription("A command line tool inspired by the Unix shell that runs entirely in your browser using ProzillaOS. Allows you to interact and manipulate the virtual drive and run silly commands.")
			.setIconUrl("/assets/apps/icons/terminal.svg")
			.setShowDesktopIcon(true),
		textEditor.setName("Notes")
			.setDescription("Text editor for reading and writing text documents in a virtual file system using ProzillaOS.")
			.setIconUrl("/assets/apps/icons/text-editor.svg"),
	],
});
```

Then reference the configuration in your component:

```tsx
// components/MyComponent.tsx

import { Desktop, ModalsView, ProzillaOS, Taskbar, WindowsView } from "prozilla-os";
import { appsConfig } from "../config/apps.config";

function MyComponent() {
	return <ProzillaOS
		systemName={"Example"}
		tagLine={"Powered by ProzillaOS"}
		config={{
			apps: appsConfig,
		}}
	>
		<Taskbar/>
		<WindowsView/>
		<ModalsView/>
		<Desktop/>
	</ProzillaOS>;
}
```

:::

Once that's done, go ahead and start your project and open it in your browser to check it out. Congratulations, you've made your own operating system inside the browser!

## Community

If you have questions or need help, reach out to the community on [Discord](https://discord.gg/JwbyQP4tdz).
