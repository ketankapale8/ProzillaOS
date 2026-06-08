import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TaskbarVolume.module.css";
import { OutsideClickListener, useClassNames } from "../../../../hooks";
import { TaskbarIndicatorMenu } from "../TaskbarIndicatorMenu";
import { useTaskbarIndicatorState } from "../taskbarIndicatorState";

export function TaskbarVolume() {
	const [active, setActive] = useTaskbarIndicatorState();

	return <OutsideClickListener onOutsideClick={() => { setActive(false); }}>
		<button title="Volume" className={useClassNames([], "Taskbar", "Indicator", "Volume")} tabIndex={0} onClick={() => { setActive(!active); }}>
			<FontAwesomeIcon icon={faVolumeHigh}/>
		</button>
		<TaskbarIndicatorMenu active={active} className={styles.Menu}>
			<FontAwesomeIcon icon={faVolumeHigh}/>
			<p>100%</p>
		</TaskbarIndicatorMenu>
	</OutsideClickListener>;
}