import { Dispatch, RefObject } from "react";
import { createSlots } from "../_utils";

/**
 * Context for {@link Taskbar}.
 */
export interface TaskbarContext {
	/** The current active menu in the taskbar. */
	activeMenu: "home" | "search" | "indicator" | null;
	/** Sets the current active menu in the taskbar. */
	setActiveMenu: (menu: TaskbarContext["activeMenu"]) => void;
	/** Toggles the active state of a menu in the taskbar.  */
	toggleMenu: (menu: TaskbarContext["activeMenu"], active?: boolean) => void;
	/** The search query for the search menu in the taskbar. */
	searchQuery: string;
	/** Sets the search query for the search menu in the taskbar. */
	setSearchQuery: Dispatch<string>;
	searchInputRef: RefObject<HTMLInputElement>;
}

export const { useSlotsContext: useTaskbarContext, SlotsProvider: TaskbarSlotsProvider } = createSlots<TaskbarContext>("Taskbar");