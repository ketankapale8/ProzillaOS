import { memo, ReactNode, type FC } from "react";
import styles from "./TaskbarIndicators.module.css";
import { attachSlots, type PropsWithSlots } from "../../_utils/slots/slots";
import { useClassNames } from "../../../hooks";
import { TaskbarBattery } from "./battery/TaskbarBattery";
import { TaskbarNetwork } from "./network/TaskbarNetwork";
import { TaskbarVolume } from "./volume/TaskbarVolume";
import { TaskbarCalendar } from "./calendar/TaskbarCalendar";
import { TaskbarDesktopButton } from "./desktop-button/TaskbarDesktopButton";
import { SlotsView } from "../../_utils/slots";

export type TaskbarIndicatorsProps = PropsWithSlots<{ Battery: FC; Network: FC; Volume: FC; Calendar: FC; DesktopButton: FC }>;

const DEFAULT_SLOTS = {
	Battery: TaskbarBattery,
	Network: TaskbarNetwork,
	Volume: TaskbarVolume,
	Calendar: TaskbarCalendar,
	DesktopButton: TaskbarDesktopButton,
};

function IndicatorsRoot({ children, ...slots }: TaskbarIndicatorsProps): ReactNode {
	return <div className={useClassNames([styles.UtilIcons], "Taskbar", "UtilIcons")}>
		<SlotsView
			defaults={DEFAULT_SLOTS}
			slots={slots}
		>
			{children}
		</SlotsView>
	</div>;
}

export const TaskbarIndicators = attachSlots<typeof IndicatorsRoot>(memo(IndicatorsRoot), {
	/** Component that renders the battery indicator in the taskbar. */
	Battery: TaskbarBattery,
	/** Component that renders the network indicator in the taskbar. */
	Network: TaskbarNetwork,
	/** Component that renders the volume indicator in the taskbar. */
	Volume: TaskbarVolume,
	/** Component that renders the calendar indicator in the taskbar. */
	Calendar: TaskbarCalendar,
	/** Component that renders the desktop button in the taskbar. */
	DesktopButton: TaskbarDesktopButton,
}, "Indicators");