import { createContext, useContext, useMemo, type FC, type ReactNode } from "react";
import { isEmpty } from "../../../features";

/**
 * Slots are components that can override or enhance parts of a root component.
 * 
 * The value of each entry is the component that will be rendered in the slot associated with the corresponding key.
 * 
 * {@link createSlots} produces a context and provider that can be used to create a component with slots.
 * Slots are ignored if the root components has any children.
 * Any missing slots will be replaced with a default component.
 * 
 * @typeParam S - A dictionary mapping each slot name to a component.
 */
export type Slots<S extends Record<string, FC>> = {
	[K in keyof S & string as `render${Capitalize<K>}`]?: FC;
};

/**
 * The props of a component that supports slots.
 * 
 * @typeParam S - A dictionary mapping each slot name to a component.
 */
export type PropsWithSlots<S extends Record<string, FC>> = Slots<S> & {
	/**
	 * The content to render instead of the slots.
	 * 
	 * If this is not an empty value, the slots will be rendered instead.
	 */
	children?: ReactNode;
};

/**
 * System that allows you to create root components and slot components.
 * 
 * @see {@link createSlots}
 * @typeParam C - The type of the context value.
 */
export interface SlotSystem<C> {
	/**
	 * A hook that returns the current context value from the {@link SlotsProvider}.
	 * 
	 * @throws If called outside of a {@link SlotsProvider}.
	 */
	useSlotsContext: () => C;
	/**
	 * Renders the slots or children with the given context value.
	 * 
	 * Usually placed inside a root component that accepts the props specified by {@link PropsWithSlots} and passes them to this component.
	 * 
	 * If {@link children} is not an empty value, they are rendered instead of the slots.
	 * 
	 * @typeParam S - A dictionary mapping each slot name to a component.
	 */
	SlotsProvider: <S extends Record<string, FC>>(props: {
		/**
		 * The context value to provide to slots via {@link useSlotsContext}.
		 * 
		 * For performance, memoize this value (e.g., with {@link useMemo} or by moving state out of render), if it is a reference, to prevent unnecessary re-renders of all slot components.
		 * A new object reference every render causes every slot to re-render even if the data hasn't changed.
		 */
		context: C,
		/** The default components to render in each slot if no override is given. */
		defaults: S,
		/** Slot components that replace the respective default component with a matching key. */
		slots: Slots<S>,
		/** Replaces all slots if not empty. */
		children?: ReactNode
	}) => ReactNode;
}

const NO_CONTEXT = Symbol("noContext");

/**
 * Creates a context for slots and a provider that renders the slots and provides the context to them.
 * 
 * Communication between the root component and its slots happens via the context.
 * The root component renders the provider returned by this function and passes the context value to it, as well as any slots or children it receives.
 * The provider then renders the children of the root component, if there are any, or the slots.
 * Slots can then use the hook to retrieve the context value from the root component.
 * 
 * @param name - The name of the component associated with these slots.
 * @typeParam C - The type of the context value.
 * @returns A {@link SlotSystem} containing the hook and provider component for the slot system.
 * @example
 * ```tsx
 * const { useSlotsContext, SlotsProvider } = createSlots<{ value: string, setValue: Dispatch<string> }>("MyComponent");
 * 
 * // By default, the slot renders the value from the context as simple text.
 * function MyDefaultSlot() {
 * 	const { value } = useSlotsContext();
 * 	return <p>{value}</p>;
 * }
 * 
 * // We can create a custom slot with an input field that can change the value via the context.
 * function MyCustomSlot() {
 * 	const { value, setValue } = useSlotsContext();
 * 	return <input value={value} onChange={(event) => setValue(event.target.value)}/>;
 * }
 * 
 * // This is the root component.
 * function MyComponent({ children, ...slots }: PropsWithSlots<{ Slot: FC }>) {
 * 	const [value, setValue] = useState("No value set");
 * 
 * 	return <SlotsProvider
 * 	  context={{ value, setValue }}
 * 	  defaults={{ Slot: MyDefaultSlot }}
 * 	  slots={slots}
 * 	>
 * 		{children}
 * 	</SlotsProvider>;
 * }
 * ```
 * ### Usage
 * ```tsx
 * // We can use the component without any props and it will render the default slot.
 * <MyComponent/>
 * 
 * // We can pass our custom slot to replace the default slot with.
 * <MyComponent renderSlot={MyCustomSlot}/>
 * 
 * // We can also replace all slots with any content (including slots) by giving the component children.
 * <MyComponent>
 * 	<h1>Hello world</h1>
 * 	<MyDefaultSlot/>
 * 	<MyCustomSlot/>
 * </MyComponent>
 * ```
 */
export function createSlots<C>(name: string, defaultValue?: C): SlotSystem<C> {
	const Context = createContext<C | typeof NO_CONTEXT>(defaultValue ?? NO_CONTEXT);
	Context.displayName = `${name}Context`;

	function useSlotsContext(): C {
		const context = useContext(Context);
		if (context === NO_CONTEXT)
			throw new Error(`${name} slots must be rendered inside ${name} to read from its context, because there is no default value.`);
		return context;
	};

	function SlotsProvider<S extends Record<string, FC>>({ context, defaults, slots, children }: {
		context: C,
		defaults: S,
		slots: Slots<S>,
		children?: ReactNode
	}): ReactNode {
		return <Context.Provider value={context}>
			{!isEmpty(children)
				? children
				: <SlotsView defaults={defaults} slots={slots}/>
			}
		</Context.Provider>;
	}

	return {
		useSlotsContext,
		SlotsProvider,
	};
}

// eslint-disable-next-line react-refresh/only-export-components
function SlotsView<S extends Record<string, FC>>({ defaults, slots }: { defaults: S, slots: Slots<S> }) {
	return useMemo(() => Object.entries(defaults).map(([name, Default]) => {
		const renderKey = `render${name.charAt(0).toUpperCase() + name.slice(1)}` as keyof typeof slots;
		const Slot = (slots[renderKey] ?? Default) as FC;
		return <Slot key={name}/>;
	}), [defaults, slots]);
}

/**
 * Attaches slot components to a root component as properties and names them.
 * @param root - The root component.
 * @param slots - The slot components.
 * @param name - The name of the root component. Usually matches the name passed to {@link createSlots}. Defaults to the displayName or the function name of {@link root}.
 * @returns The root component with the slot components attached to it.
 * @example
 * ```tsx
 * const Accordion = attachSlots(AccordionRoot, {
 *   Summary: AccordionSummary,
 *   Details: AccordionDetails,
 * });
 * ```
 * ### Usage
 * ```tsx
 * <Accordion>
 * 	<Accordion.Summary/>
 * 	<Accordion.Details/>
 * </Accordion>
 * ```
 */
export function attachSlots<T extends FC, S extends Record<string, FC>>(root: T, slots: S, name?: string) {
	const rootName = name ?? root.displayName ?? root.name;

	if (rootName) {
		root.displayName = rootName;
		for (const [name, slot] of Object.entries(slots)) {
			if (typeof slot === "function" && !slot.displayName) {
				slot.displayName = `${rootName}.${name}`;
			}
		}
	}

	return Object.assign(root, slots);
}

/**
 * Utility functions related to slots.
 * @see {@link createSlots}
 */
export namespace Slot {
	/**
	 * An empty slot with no content.
	 * @example
	 * Using an empty slot to hide the apps in the taskbar:
	 * ```tsx
	 * <Taskbar renderApps={Slot.Empty}/>
	 * ```
	 */
	export const Empty: FC = () => null;
	Empty.displayName = "Empty";
}
