import type { DefaultTheme } from "vitepress";
import { getPackageReferenceItems, PACKAGES } from "./packages.config";

type SidebarItem = Omit<DefaultTheme.SidebarItem, "items"> & {
    draft?: boolean;
    items?: SidebarItem[];
};

const COMMON_ITEMS: SidebarItem[] = [
	{
		text: "About",
		base: "/about",
		collapsed: false,
		items: [
			{ text: "Introduction", link: "/introduction" },
			{ text: "Examples", link: "/examples" },
			{ text: "Features", link: "/features" },
			{ text: "Skins", link: "/skins" },
			{ text: "Showcase", link: "/showcase" },
		],
	},
	{
		text: "Guides",
		base: "/guides",
		collapsed: false,
		items: [
			{ text: "Getting Started", link: "/getting-started" },
			{ text: "App Development", link: "/custom-app" },
			{ text: "File System", link: "/file-system" },
			{ text: "Style Overrides", link: "/style-overrides", draft: true },
			{ text: "Writing Tests", link: "/testing", draft: true },
			{ text: "Logging and Debugging", link: "/logging", draft: true },
			{
				text: "Advanced",
				collapsed: true,
				items: [
					{ text: "Self-hosting", link: "/self-hosting" },
					{ text: "Development", link: "/development" },
				],
			},
		],
	},
];

export function getSidebarItems(isDev: boolean): DefaultTheme.SidebarItem[] {
	return filterDrafts(
		[
			...COMMON_ITEMS,
			{
				text: "Packages",
				base: "/reference",
				collapsed: false,
				items: [
					{ text: "Overview", link: "/packages" },
					...getPackageReferenceItems(PACKAGES),
				],
			},
		],
		isDev
	);
}

export function getNavigationItems(isDev: boolean): DefaultTheme.NavItem[] {
	return filterDrafts(
		[
			...COMMON_ITEMS.map((section) =>
				section.base === "/guides"
					? { ...section, items: section.items?.filter((item) => "link" in item) }
					: section
			),
			{
				text: "Packages",
				base: "/reference",
				collapsed: false,
				items: [
					{ text: "Overview", link: "/packages" },
					...getPackageReferenceItems(PACKAGES, ["Apps"]).flatMap(({ items }) => items ?? []),
				],
			},
		],
		isDev
	).map(sidebarToNavItem);
}

function filterDrafts(items: SidebarItem[], isDev: boolean): DefaultTheme.SidebarItem[] {
	return items
		.filter(({ draft }) => isDev || !draft)
		.map(({ draft, items: children, ...rest }) => ({
			...rest,
			...isDev && draft ? { text: `${rest.text}*` } : {},
			...children ? { items: filterDrafts(children, isDev) } : {},
		}));
}

function sidebarToNavItem({ text: navigationText, base, items = [] }: DefaultTheme.SidebarItem): DefaultTheme.NavItem {
	return {
		text: navigationText,
		items: items.map(({ text = "", link = "" }) => ({
			text,
			activeMatch: base ? base + link : link,
			link: base ? base + link : link,
		})),
	};
}