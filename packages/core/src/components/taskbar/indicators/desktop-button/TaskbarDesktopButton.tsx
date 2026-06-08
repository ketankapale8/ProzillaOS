import { useClassNames, useWindowsManager } from "../../../../hooks";
import styles from "./TaskbarDesktopButton.module.css";

export function TaskbarDesktopButton() {
	const windowsManager = useWindowsManager();

	return <button
		title="Show Desktop"
		className={useClassNames([styles.DesktopButton], "Taskbar", "UtilIcon", "Desktop")}
		onClick={() => { windowsManager?.minimizeAll(); }}
	/>;
}