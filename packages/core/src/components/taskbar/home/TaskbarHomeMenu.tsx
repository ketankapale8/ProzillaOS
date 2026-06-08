import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TaskbarHomeMenu.module.css";
import appStyles from "../TaskbarMenus.module.css";
import { faCircleInfo, faFileLines, faGear, faImage, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { ReactSVG } from "react-svg";
import { useEffect, useState } from "react";
import { useClassNames, useInstalledApps, useKeyboardListener, useSystemManager, useVirtualRoot, useWindowsManager } from "../../../hooks";
import { AppsConfig, closeViewport } from "../../../features";
import { utilStyles } from "../../../styles";
import { Vector2 } from "@prozilla-os/shared";
import { VectorImage } from "../../_utils/vector-image/VectorImage";
import { useTaskbarContext } from "../taskbarSlots";

export function TaskbarHomeMenu() {
	const { activeMenu, setActiveMenu, toggleMenu } = useTaskbarContext();
	const active = activeMenu === "home";
	const { systemName, appsConfig, skin } = useSystemManager();
	const windowsManager = useWindowsManager();
	const virtualRoot = useVirtualRoot();
	const [tabIndex, setTabIndex] = useState(active ? 0 : -1);

	useEffect(() => {
		setTabIndex(active ? 0 : -1);
	}, [active]);

	const classNames = [styles.HomeMenuContainer];
	if (active)
		classNames.push(styles.Active);

	let onlyAltKey = false;
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Alt") {
			event.preventDefault();
			onlyAltKey = true;
		} else {
			onlyAltKey = false;

			if (active && event.key.length === 1)
				setActiveMenu("search");
		}
	};

	const onKeyUp = (event: KeyboardEvent) => {
		if (event.key === "Alt" && onlyAltKey) {
			event.preventDefault();
			toggleMenu("home");
			onlyAltKey = false;
		} else {
			onlyAltKey = false;
		}
	};

	useKeyboardListener({ onKeyDown, onKeyUp });

	const apps = useInstalledApps();
	const fileExplorerApp = appsConfig.getAppByRole(AppsConfig.APP_ROLES.fileExplorer);
	const settingsApp = appsConfig.getAppByRole(AppsConfig.APP_ROLES.settings);
	const textEditorApp = appsConfig.getAppByRole(AppsConfig.APP_ROLES.textEditor);

	const appButtonClassName = useClassNames([appStyles.AppButton], "SearchMenu", "AppButton");

	return <div className={classNames.join(" ")}>
		<div className={useClassNames([styles.HomeMenu], "Taskbar", "Menu", "Home")}>
			<div className={useClassNames([styles.Buttons], "HomeMenu", "Buttons")}>
				<button tabIndex={tabIndex} onClick={() => { closeViewport(true, systemName); }}>
					<FontAwesomeIcon icon={faPowerOff}/>
					<p className={utilStyles.TextRegular}>Shut down</p>
				</button>
				{settingsApp != null &&
					<button tabIndex={tabIndex} onClick={() => {
						toggleMenu("home", false);
						windowsManager?.open("settings");
					}}>
						<FontAwesomeIcon icon={faGear}/>
						<p className={utilStyles.TextRegular}>Settings</p>
					</button>
				}
				{textEditorApp != null &&
					<button tabIndex={tabIndex} onClick={() => {
						toggleMenu("home", false);
						windowsManager?.open("text-editor", {
							mode: "view",
							file: virtualRoot?.navigate("~/Documents/Info.md"),
							size: new Vector2(575, 675),
						});
					}}>
						<FontAwesomeIcon icon={faCircleInfo}/>
						<p className={utilStyles.TextRegular}>Info</p>
					</button>
				}
				{fileExplorerApp != null && <>
					<button tabIndex={tabIndex} onClick={() => {
						toggleMenu("home", false);
						windowsManager?.open(fileExplorerApp.id, { path: "~/Pictures" });
					}}>
						<FontAwesomeIcon icon={faImage}/>
						<p className={utilStyles.TextRegular}>Images</p>
					</button>
					<button tabIndex={tabIndex} onClick={() => {
						toggleMenu("home", false);
						windowsManager?.open(fileExplorerApp.id, { path: "~/Documents" }); }
					}>
						<FontAwesomeIcon icon={faFileLines}/>
						<p className={utilStyles.TextRegular}>Documents</p>
					</button>
				</>}
			</div>
			<div className={useClassNames([styles.Apps], "HomeMenu", "Apps")}>
				<span className={useClassNames([styles.Logo], "HomeMenu", "Logo")}>
					<ReactSVG src={skin.systemIcon}/>
					<h1 className={utilStyles.TextBold}>{systemName}</h1>
				</span>
				<div className={useClassNames([appStyles.AppList], "HomeMenu", "AppList")}>
					{apps.map(({ name, id, iconUrl }) =>
						<button
							key={id}
							className={appButtonClassName}
							tabIndex={tabIndex}
							onClick={() => {
								toggleMenu("home", false);
								windowsManager?.open(id);
							}}
							title={name}
						>
							<VectorImage src={iconUrl ?? ""}/>
							<h2 className={utilStyles.TextRegular}>{name}</h2>
						</button>
					)}
				</div>
			</div>
		</div>
	</div>;
}