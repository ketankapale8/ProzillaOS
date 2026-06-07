---
outline: deep
description: "Learn how to use the virtual drive system to manage files and folders in ProzillaOS"
---

# File system

The virtual drive is an in-memory file system that acts just like a real operating system's file manager. You can create folders, store files with content or external sources, create symbolic links and persist everything through localStorage.

## Prerequisites

This guide assumes you have a basic ProzillaOS project set up. See the [Getting started guide](./getting-started) for more information.

## Accessing the virtual drive

The virtual drive is represented by a `VirtualRoot` instance, which is a fancy folder that contains all files and other folders, managed internally by ProzillaOS. To access it from a component, use the `useVirtualRoot()` hook as shown here:

```tsx
import { useVirtualRoot } from "@prozilla-os";

function MyComponent() {
	const virtualRoot = useVirtualRoot();

	if (!virtualRoot)
		return null;

	return <div>
		<p>Root path: {virtualRoot.displayPath}</p>
	</div>;
}
```

## Working with folders

### Creating folders

Every [`VirtualFolder`](../reference/core/Classes/VirtualFolder) exposes a fluent builder API. Call `createFolder()` on any folder, including the root:

```ts
virtualRoot.createFolder("projects", (folder) => {
	folder.setAlias("proj");
});

virtualRoot
	.createFolder("documents")
	.createFolder("images")
	.createFolder("videos");
```

### Navigating the tree

Use `navigate(relativePath)` to traverse the filesystem. It accepts Unix-style paths and will return `null` if the path could not be resolved:

```ts
const projects = virtualRoot.navigate("projects");
const note = virtualRoot.navigate("documents/notes/readme.md");

// Narrow the result with navigateToFolder or navigateToFile
const docs = virtualRoot.navigateToFolder("documents");
const file = docs?.navigateToFile("notes/readme.md");
```

### Finding items

```ts
// Search inside a folder
const found = projects?.findSubFolder("web");
const readme = docs?.findFile("readme", "md");

// Check existence
const hasNotes = docs?.hasFolder("notes");
```

## Working with files

### Creating files

Files are created inside a folder with a name and an optional extension:

```ts
virtualRoot.createFile("hello", "txt", (file) => {
	file.setContent("Hello, world!");
});

// Create multiple files at once
virtualRoot.createFiles([
	{ name: "index", extension: "html" },
	{ name: "style", extension: "css" },
]);
```

### Setting content vs source

A `VirtualFile` can hold either raw **content** or an external **source** URL:

```ts
// Raw text content
file.setContent("Hello, world!");
file.setContent(["Line 1", "Line 2", "Line 3"]);

// External source URL
file.setSource("https://example.com/data.json");
```

Call `read()` to get the resolved content:

```ts
const content = await file.read();
// Returns text content, fetches from source URL, or returns null
```

### Downloading files

```ts
if (file.isDownloadable()) {
	file.download(); // Triggers a browser download
}
```

## File links and folder links

Links are analogous to symbolic links (symlinks) on Unix systems. They point to another file or folder without duplicating data.

```ts
// Create a link to a file
docs.createFileLink("readme-shortcut", (link) => {
	link.setLinkedPath("notes/readme.md");
});

// Create a link to a folder
virtualRoot.createFolderLink("my-projects", (link) => {
	link.setLinkedPath("projects");
});
```

## Persistence

The virtual drive can automatically save and restore its state using localStorage. Configure this in your `VirtualDriveConfig`:

```ts
const virtualDriveConfig = new VirtualDriveConfig({
	saveData: {
		prefix: "my-app-",
	},
});
```

Disable persistence by setting `saveData` to `false`:

```ts
const virtualDriveConfig = new VirtualDriveConfig({
	saveData: false,
});
```

> [!NOTE]
> When `saveData` is enabled, the virtual drive loads saved data on top of the default data every time ProzillaOS starts. Items that have been modified by the user are flagged with `editedByUser` and are serialized when saving.

## Customizing default data

The `VirtualDriveConfig` lets you include or exclude built-in folders:

```ts
const virtualDriveConfig = new VirtualDriveConfig({
	defaultData: {
		includePicturesFolder: false,
		includeDocumentsFolder: true,
		includeDesktopFolder: false,
	},
});
```

For full control, provide a `loadData` callback that receives the `VirtualRoot` instance:

```ts
const virtualDriveConfig = new VirtualDriveConfig({
	defaultData: {
		loadData: (virtualRoot) => {
			virtualRoot.createFolder("projects", (folder) => {
				folder.createFile("notes", "md", (file) => {
					file.setContent("# My notes");
				});
			});

			virtualRoot.createFile("welcome", "txt", (file) => {
				file.setContent("Welcome to my OS!");
			});
		},
	},
});
```

## Example

Here is a complete component that displays the contents of the current folder and lets you create a new file:

```tsx
import { useVirtualRoot, VirtualFile, VirtualFolder } from "prozilla-os";
import { useState } from "react";

export function FileBrowser() {
	const virtualRoot = useVirtualRoot();
	const [currentFolder, setCurrentFolder] = useState<VirtualFolder | null>(null);

	if (!virtualRoot)
		return null;

	const folder = currentFolder ?? virtualRoot;

	return <div>
		<h2>Contents of {folder.displayPath}</h2>

		<h3>Folders</h3>
		<ul>
			{folder.getSubFolders().map((subFolder) => (
				<li key={subFolder.id}>
					<button onClick={() => setCurrentFolder(subFolder)}>
						{subFolder.name}
					</button>
				</li>
			))}
		</ul>

		<h3>Files</h3>
		<ul>
			{folder.getFiles().map((file) => (
				<li key={file.id}>{file.id}</li>
			))}
		</ul>

		<button onClick={() => {
			folder.createFile("new-file", "txt", (file) => {
				file.setContent("Created at " + new Date().toISOString());
			});
		}}>
			New file
		</button>

		{currentFolder && (
			<button onClick={() => setCurrentFolder(null)}>
				Go to root
			</button>
		)}
	</div>;
}
```
