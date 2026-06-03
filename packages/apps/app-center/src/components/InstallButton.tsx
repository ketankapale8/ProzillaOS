import { Button, useClassNames, useSkinOverrides } from "@prozilla-os/core";
import { MacOsSkin } from "@prozilla-os/skins";
import styles from "./InstallButton.module.css";
import { capitalize } from "@prozilla-os/shared";

interface InstallButtonProps {
	isInstalled: boolean;
	onInstall: () => void;
	onUninstall: () => void;
	variant?: "card" | "detail" | "hero";
	className?: string;
}

const textOverrides = new Map([[MacOsSkin, { install: "Get" }]]);

export function InstallButton({ isInstalled, onInstall, onUninstall, variant = "card", className }: InstallButtonProps) {
	const text = useSkinOverrides(textOverrides, { install: "Install", uninstall: "Uninstall" });

	const classNames = [styles.InstallButton, styles[capitalize(variant)], className];
	if (isInstalled)
		classNames.push(styles.Installed);

	return <Button className={useClassNames(classNames)} onClick={isInstalled ? onUninstall : onInstall}>
		{isInstalled ? text.uninstall : text.install}
	</Button>;
}
