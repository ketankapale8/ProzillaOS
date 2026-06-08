import { ReactNode } from "react";
import styles from "./TaskbarIndicatorMenu.module.css";
import { useClassNames } from "../../../hooks";

interface TaskbarIndicatorMenuProps {
	active: boolean;
	className?: string;
	children: ReactNode;
}

export function TaskbarIndicatorMenu({ active, className, children }: TaskbarIndicatorMenuProps) {
	const classNames = [styles.IndicatorMenuContainer];
	if (active)
		classNames.push(styles.Active);
	if (className != null)
		classNames.push(className);

	const modifiers = ["Util"];
	if (active)
		modifiers.push("Active");

	return <div className={useClassNames(classNames)}>
		<div className={useClassNames([styles.IndicatorMenu], "Taskbar", "Menu", modifiers)}>
			{children}
		</div>
	</div>;
}