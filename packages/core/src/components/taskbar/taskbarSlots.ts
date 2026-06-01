import { Dispatch } from "react";
import { createSlots } from "../_utils";

/**
 * Context for {@link Taskbar}.
 */
export interface TaskbarContext {
	showHome: boolean;
	setShowHome: Dispatch<boolean>;
	showSearch: boolean;
	setShowSearch: Dispatch<boolean>;
	hideUtilMenus: boolean;
	setHideUtilMenus: Dispatch<boolean>;
	showUtilMenus: () => void;
}

export const { useSlotsContext: useTaskbarContext, SlotsProvider: TaskbarSlotsProvider } = createSlots<TaskbarContext>("Taskbar");