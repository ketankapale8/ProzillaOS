import { faBatteryEmpty, faBatteryFull, faBatteryHalf, faBatteryQuarter, faBatteryThreeQuarters, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import styles from "./TaskbarBattery.module.css";
import { OutsideClickListener, useClassNames } from "../../../../hooks";
import { TaskbarIndicatorMenu } from "../TaskbarIndicatorMenu";
import { useTaskbarIndicatorState } from "../taskbarIndicatorState";

type BatteryManager = {
	charging: boolean;
	level: number;
	addEventListener: (event: string, handler: () => void) => void;
	removeEventListener: (event: string, handler: () => void) => void;
};

export function TaskbarBattery() {
	const [active, setActive] = useTaskbarIndicatorState();
	const [isCharging, setIsCharging] = useState(true);
	const [percentage, setPercentage] = useState(100);
	// const [chargingTime, setChargingTime] = useState(0);
	// const [dischargingTime, setDischargingTime] = useState(0);

	useEffect(() => {
		const getBattery = (navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }).getBattery;
		if (!getBattery) return;

		let cleanUp: (() => void) | undefined;
		void getBattery().then((battery: BatteryManager) => {
			const updateIsCharging = () => {
				setIsCharging(battery.charging);
			};

			const updatePercentage = () => {
				setPercentage(battery.level * 100);
			};

			// const updateChargingTime = () => {
			// 	setChargingTime(battery.chargingTime);
			// };

			// const updateDischargingTime = () => {
			// 	setDischargingTime(battery.dischargingTime);
			// };

			updateIsCharging();
			updatePercentage();
			// updateChargingTime();
			// updateDischargingTime();

			battery.addEventListener("chargingchange", updateIsCharging);
			battery.addEventListener("levelchange", updatePercentage);
			// battery.addEventListener("chargingtimechange", updateChargingTime);
			// battery.addEventListener("dischargingtimechange", updateDischargingTime);

			cleanUp = () => {
				battery.removeEventListener("chargingchange", updateIsCharging);
				battery.removeEventListener("levelchange", updatePercentage);
				// battery.removeEventListener("chargingtimechange", updateChargingTime);
				// battery.removeEventListener("dischargingtimechange", updateDischargingTime);
			};
		});
		
		return () => {
			cleanUp?.();
		};
	}, []);

	let icon = faBatteryFull;
	if (percentage < 10) {
		icon = faBatteryEmpty;
	} else if (percentage < 35) {
		icon = faBatteryQuarter;
	} else if (percentage < 65) {
		icon = faBatteryHalf;
	} else if (percentage < 90) {
		icon = faBatteryThreeQuarters;
	}

	return <OutsideClickListener onOutsideClick={() => { setActive(false); }}>
		<button className={useClassNames([styles.Button], "Taskbar", "Indicator", "Battery")} title="Battery" tabIndex={0} onClick={() => { setActive(!active); }}>
			{!isCharging
				? <FontAwesomeIcon className={styles["Charging-indicator"]} icon={faMinus}/>
				: null
			}
			<FontAwesomeIcon icon={icon}/>
		</button>
		<TaskbarIndicatorMenu active={active} className={styles.Menu}>
			<div>
				{!isCharging
					? <FontAwesomeIcon className={styles["Charging-indicator"]} icon={faMinus}/>
					: null
				}
				<FontAwesomeIcon icon={icon}/>
			</div>
			<p>{Math.round(percentage)}%</p>
		</TaskbarIndicatorMenu>
	</OutsideClickListener>;
}