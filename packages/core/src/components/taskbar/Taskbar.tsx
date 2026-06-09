import { memo, MouseEvent, ReactNode, useCallback, useMemo, useRef, useState, type FC } from "react";
import styles from "./Taskbar.module.css";
import { attachSlots, InferSlots, type PropsWithSlots } from "../_utils/slots/slots";
import { useClassNames, useSystemManager } from "../../hooks";
import { useContextMenu } from "../../hooks/modals/contextMenu";
import { Actions } from "../actions/Actions";
import { ClickAction } from "../actions/actions/ClickAction";
import { useWindowsManager } from "../../hooks/windows/windowsManagerContext";
import { useZIndex } from "../../hooks/z-index/zIndex";
import { ZIndexManager } from "../../features/z-index/zIndexManager";
import { AppsConfig } from "../../features";
import { TaskbarSlotsProvider } from "./taskbarSlots";
import { TaskbarHome } from "./home/TaskbarHome";
import { TaskbarSearch } from "./search/TaskbarSearch";
import { TaskbarApps } from "./apps/TaskbarApps";
import { TaskbarIndicators } from "./indicators/TaskbarIndicators";
import type { TaskbarContext } from "./taskbarSlots";

/**
 * Props for {@link Taskbar}.
 */
export type TaskbarProps = PropsWithSlots<{ Home: FC; Search: FC; Apps: FC; Indicators: FC }>;

const DEFAULT_SLOTS: InferSlots<TaskbarProps> = {
	Home: TaskbarHome,
	Search: TaskbarSearch,
	Apps: TaskbarApps,
	Indicators: TaskbarIndicators,
};

function TaskbarRoot({ children, ...slots }: TaskbarProps): ReactNode {
	const { taskbarConfig, appsConfig } = useSystemManager();
	const [activeMenu, setActiveMenu] = useState<TaskbarContext["activeMenu"]>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const searchInputRef = useRef<HTMLInputElement>(null);
	const windowsManager = useWindowsManager();
	const zIndex = useZIndex({ groupIndex: ZIndexManager.GROUPS.TASKBAR, index: 0 });
	const settingsApp = appsConfig.getAppByRole(AppsConfig.APP_ROLES.settings);
	const { onContextMenu } = useContextMenu({ Actions: (props) =>
		<Actions avoidTaskbar={false} {...props}>
			{settingsApp != null &&
				<ClickAction label={`Open ${settingsApp.name}`} icon={settingsApp.iconUrl as string | undefined} onTrigger={() => {
					windowsManager?.open(settingsApp.id);
				}}/>
			}
		</Actions>,
	});

	const updateActiveMenu = useCallback<TaskbarContext["setActiveMenu"]>((menu) => {
		if (activeMenu === menu)
			return;

		setActiveMenu(menu);

		if (menu === "search") {
			if (searchQuery !== "")
				setSearchQuery("");

			if (searchInputRef.current) {
				searchInputRef.current.focus();
				window.scrollTo(0, document.body.scrollHeight);
			}
		}
	}, [activeMenu, setActiveMenu, searchQuery, setSearchQuery, searchInputRef]);

	const context: TaskbarContext = useMemo(() => ({
		activeMenu,
		setActiveMenu: updateActiveMenu,
		toggleMenu: (menu, active = activeMenu !== menu) => {
			if (menu === activeMenu && !active) {
				updateActiveMenu(null);
			} else if (menu !== activeMenu && active) {
				updateActiveMenu(menu);
			}
		},
		searchQuery,
		setSearchQuery,
		searchInputRef,
	}), [activeMenu, updateActiveMenu, searchQuery, setSearchQuery, searchInputRef]);

	const modifiers: string[] = [];
	if (activeMenu === "home")
		modifiers.push("HomeActive");

	return <div
		style={{ "--taskbar-height": `${taskbarConfig.height}px`, zIndex }}
		className={useClassNames([styles.Taskbar], "Taskbar", undefined, modifiers)}
		data-allow-context-menu={true}
		onContextMenu={(event) => {
			if ((event.target as HTMLElement).getAttribute("data-allow-context-menu"))
				onContextMenu(event as unknown as MouseEvent<HTMLElement, MouseEvent>);
		}}
	>
		<TaskbarSlotsProvider
			context={context}
			defaults={DEFAULT_SLOTS}
			slots={slots}
			layout={TaskbarLayout}
		>
			{children}
		</TaskbarSlotsProvider>
	</div>;
}

function TaskbarLayout({ Home, Search, Apps, Indicators }: InferSlots<TaskbarProps>) {
	return <>
		<div className={useClassNames([styles.Menus], "Taskbar", "MenuIcons")}>
			<Home/>
			<Search/>
		</div>
		<Apps/>
		<Indicators/>
	</>;
}

/**
 * Component that renders the home menu, search menu, pinned and active applications and various indicators.
 */
export const Taskbar = attachSlots<typeof TaskbarRoot>(memo(TaskbarRoot), {
	/** Component that renders the home menu in the taskbar. */
	Home: TaskbarHome,
	/** Component that renders the search menu in the taskbar. */
	Search: TaskbarSearch,
	/** Component that renders the pinned and active applications in the taskbar. */
	Apps: TaskbarApps,
	/** Component that renders the indicators in the taskbar. */
	Indicators: TaskbarIndicators,
}, "Taskbar");