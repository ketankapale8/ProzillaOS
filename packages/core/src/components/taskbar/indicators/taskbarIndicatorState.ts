import { useCallback, useEffect, useState } from "react";
import { useTaskbarContext } from "../taskbarSlots";

export function useTaskbarIndicatorState() {
	const { activeMenu, toggleMenu } = useTaskbarContext();
	const [indicatorActive, setIndicatorActive] = useState(false);

	useEffect(() => {
		if (activeMenu !== "indicator" && indicatorActive) {
			setIndicatorActive(false);
		}
	}, [activeMenu, indicatorActive]);

	const setIndicatorState = useCallback((show: boolean) => {
		toggleMenu("indicator", show);
		setIndicatorActive(show);
	}, [toggleMenu, setIndicatorActive]);

	return [indicatorActive, setIndicatorState] as const;
}