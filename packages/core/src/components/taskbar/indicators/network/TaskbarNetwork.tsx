import { faWifi } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TaskbarNetwork.module.css";
import { OutsideClickListener, useClassNames } from "../../../../hooks";
import { TaskbarIndicatorMenu } from "../TaskbarIndicatorMenu";
import { useTaskbarIndicatorState } from "../taskbarIndicatorState";

export function TaskbarNetwork() {
	const [active, setActive] = useTaskbarIndicatorState();

	return <OutsideClickListener onOutsideClick={() => { setActive(false); }}>
		<button title="Network" className={useClassNames([], "Taskbar", "Indicator", "Network")} tabIndex={0} onClick={() => { setActive(!active); }}>
			<FontAwesomeIcon icon={faWifi}/>
		</button>
		<TaskbarIndicatorMenu active={active} className={styles.Menu}>
			<FontAwesomeIcon icon={faWifi}/>
			<p>Connected</p>
		</TaskbarIndicatorMenu>
	</OutsideClickListener>;
}