import { useEffect, useState } from "react";
import styles from "./TaskbarCalendar.module.css";
import { OutsideClickListener, useClassNames } from "../../../../hooks";
import { TaskbarIndicatorMenu } from "../TaskbarIndicatorMenu";
import { useTaskbarIndicatorState } from "../taskbarIndicatorState";

export function TaskbarCalendar() {
	const [date, setDate] = useState(new Date());
	const [active, setActive] = useTaskbarIndicatorState();

	useEffect(() => {
		const interval = setInterval(() => {
			setDate(new Date());
		}, active ? 500 : 30000);

		return () => {
			clearInterval(interval);
		};
	}, [active]);

	return <OutsideClickListener onOutsideClick={() => { setActive(false); }}>
		<button className={useClassNames([styles.Button], "Taskbar", "Indicator", "Calendar")} title="Date & Time" tabIndex={0} onClick={() => { setActive(!active); }}>
			<p>
				{date.toLocaleString("en-GB", {
					hour: "numeric",
					minute: "numeric",
					hour12: false,
				})}
			</p>
			<p>
				{date.toLocaleDateString("en-GB", {
					day: "numeric",
					month: "short",
					year: "numeric",
				})}
			</p>
		</button>
		<TaskbarIndicatorMenu active={active} className={styles.Menu}>
			<p className={styles.Time}>{date.toLocaleString("en-GB", {
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
				hour12: false,
			})}</p>
			<p className={styles.Date}>{date.toLocaleString("en-GB", {
				weekday: "long",
				day: "numeric",
				month: "long",
				year: "numeric",
			})}</p>
		</TaskbarIndicatorMenu>
	</OutsideClickListener>;
}