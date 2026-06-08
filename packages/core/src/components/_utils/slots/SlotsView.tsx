import { FC, ReactNode, useMemo } from "react";
import { type Slots } from "./slots";
import { isEmpty } from "../../../features";

/**
 * Props for {@link SlotsView}.
 */
export interface SlotsViewProps<S extends Record<string, FC>> {
	/** The default components to render in each slot if no override is given. */
	defaults: S;
	/** Slot components that replace the respective default component with a matching key. */
	slots: Slots<S>;
	/** Callback function that renders the resolved slots in a custom layout instead of rendering them in their order in {@link defaults}. */
	layout?: (slots: S) => ReactNode;
	/** Replaces all slots if not empty. */
	children?: ReactNode;
}

/**
 * Component that renders slots if there are no children.
 * 
 * Slots are displayed in the order they appear in {@link SlotsViewProps.defaults}, unless a different layout is specified with {@link SlotsViewProps.layout}.
 * If a slot override is not provided, the respective default slot from {@link SlotsViewProps.defaults} is displayed instead.
 */
export function SlotsView<S extends Record<string, FC>>({ defaults, slots, layout, children }: SlotsViewProps<S>): ReactNode {
	return !isEmpty(children)
		? children
		: <SlotsRenderer defaults={defaults} slots={slots} layout={layout}/>;
}

// Separate component to render slots, to avoid computing them when they aren't needed
function SlotsRenderer<S extends Record<string, FC>>({ defaults, slots, layout }: Omit<SlotsViewProps<S>, "children">) {
	// TODO: Fix type safety
	const resolvedSlots = useMemo(() => Object.fromEntries(Object.entries(defaults).map(([name, Default]) => {
		const renderKey = `render${name.charAt(0).toUpperCase() + name.slice(1)}` as keyof typeof slots;
		return [name, (slots[renderKey] ?? Default) as FC];
	})) as S, [defaults, slots]);

	return layout
		? layout(resolvedSlots)
		: Object.entries(resolvedSlots).map(([name, Slot]) => <Slot key={name}/>);
}