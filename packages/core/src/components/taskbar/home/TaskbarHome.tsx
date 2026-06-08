import { ReactSVG } from "react-svg";
import menuStyles from "../TaskbarMenus.module.css";
import styles from "./TaskbarHome.module.css";
import { OutsideClickListener, useClassNames, useSystemManager } from "../../../hooks";
import { useTaskbarContext } from "../taskbarSlots";
import { TaskbarHomeMenu } from "./TaskbarHomeMenu";

export function TaskbarHome() {
	const { systemName, skin } = useSystemManager();
	const { toggleMenu } = useTaskbarContext();

	return <div className={styles.HomeContainer}>
		<OutsideClickListener onOutsideClick={() => { toggleMenu("home", false); }}>
			<button
				className={useClassNames([menuStyles.MenuButton, styles.HomeButton], "Taskbar", "HomeIcon")}
				title="Home"
				tabIndex={0}
				onClick={() => { toggleMenu("home"); }}
			>
				{skin.systemIcon.endsWith(".svg")
					? <ReactSVG src={skin.systemIcon}/>
					: <img src={skin.systemIcon} alt={systemName}/>
				}
			</button>
			<TaskbarHomeMenu/>
		</OutsideClickListener>
	</div>;
}