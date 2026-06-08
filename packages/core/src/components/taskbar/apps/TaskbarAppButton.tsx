import { memo, MouseEvent } from "react";
import { App } from "../../../features";
import { useClassNames, useContextMenu, useWindowsManager } from "../../../hooks";
import { Actions, ClickAction } from "../../actions";
import styles from "./TaskbarAppButton.module.css";
import { VectorImage } from "../../_utils/vector-image/VectorImage";

export interface TaskbarAppButtonProps {
	app: App;
	active: boolean;
	visible: boolean;
}

export const TaskbarAppButton = memo(({ app, active, visible }: TaskbarAppButtonProps) => {
	const windowsManager = useWindowsManager();
	// const settingsManager = useSettingsManager();
	const { onContextMenu } = useContextMenu({ Actions: (props) =>
		<Actions avoidTaskbar={false} {...props}>
			<ClickAction label={app.name} icon={app.iconUrl as string | undefined} onTrigger={() => {
				windowsManager?.open(app.id);
			}}/>
			{/* <ClickAction label={isPinned ? "Unpin from taskbar" : "Pin to taskbar"} icon={faThumbTack} onTrigger={() => {
				const newPins = [...pins];
				if (isPinned) {
					removeFromArray(app.id, pins);
				} else {
					newPins.push(app.id);
				}

				const settings = settingsManager.get(SettingsManager.VIRTUAL_PATHS.taskbar);
				void settings.set("pins", newPins.join(","));
			}}/>
			{active && <ClickAction label="Close window" icon={faTimes} onTrigger={() => {
				windowsManager.close(windowsManager.getAppWindowId(app.id));
			}}/>} */}
		</Actions>,
	});

	if (!windowsManager)
		return;

	const classNames = [styles.AppIcon];
	if (active)
		classNames.push(styles.Active);
	if (!visible)
		classNames.push(styles.Hidden);

	return <button
		key={app.id}
		tabIndex={0}
		className={useClassNames(classNames, "Taskbar", "AppIcon")}
		onClick={() => {
			const windowId =  windowsManager.getAppWindowId(app.id);

			if (!active || windowId == null) {
				windowsManager.open(app.id);
			} else if (!windowsManager.isFocused(windowId)) {
				windowsManager.focus(windowId);
			} else {
				windowsManager.setMinimized(windowId);
			}
		}}
		onContextMenu={(event) => {
			if (visible)
				onContextMenu(event as unknown as MouseEvent<HTMLElement, MouseEvent>);
		}}
		title={app.name}
	>
		<VectorImage src={app.iconUrl as string}/>
	</button>;
});