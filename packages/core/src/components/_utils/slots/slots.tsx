import { ComponentProps, createContext, useContext, type FC, type ReactNode } from "react";
import { SlotsView, type SlotsViewProps } from "./SlotsView";

/**
 * Slots are components that can override or enhance parts of a root component.
 * 
 * The value of each entry is the component that will be rendered in the slot associated with the corresponding key.
 * 
 * {@link SlotsView} can be used to render slots.
 * Slots are ignored if this components has any children.
 * Any missing slots will be replaced with a default component.
 * 
 * {@link createSlots} produces a context and provider that can be used to create a component with slots and give them access to a shared context.
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
	 * If this is an empty value, the slots will be rendered instead.
	 */
	children?: ReactNode;
};

/**
 * Infers the dictionary that maps slot names to components from the props of a component with slots (e.g., a component with props of type {@link PropsWithSlots}).
 * @example
 * ### From props
 * This can be used to infer the slots from the props of a component with slots:
 * ```ts
 * type MyProps = PropsWithSlots<{ SlotA: FC; SlotB: FC }>;
 * type MySlots = InferSlots<MyProps>; // Result: { SlotA: FC; SlotB: FC }
 * ```
 * ### From a component
 * This can also be used in combination with `ComponentProps` to infer the slots directly from a component with slots.
 * ```ts
 * function MyComponent(props: PropsWithSlots<{ SlotA: FC; SlotB: FC }>) {
 * 	// ...
 * }
 * 
 * type MySlots = InferSlots<ComponentProps<typeof MyComponent>>; // Result: { SlotA: FC; SlotB: FC }
 * ```
 */
export type InferSlots<T extends Slots<Record<string, FC>>> = {
    [K in keyof T & string as K extends `render${infer Key}` 
        ? Key
        : never]: Exclude<T[K], undefined>;
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
	 * If {@link props.children} is not an empty value, they are rendered instead of the slots.
	 * 
	 * @typeParam S - A dictionary mapping each slot name to a component.
	 */
	SlotsProvider: <S extends Record<string, FC>>(props: SlotsViewProps<S> & {
		/**
		 * The context value to provide to slots via {@link useSlotsContext}.
		 */
		context: C,
	}) => ReactNode;
}

const NO_CONTEXT = Symbol("noContext");

/**
 * Creates a context for slots and a provider that renders the slots and provides the context to them.
 * 
 * Communication between the root component and its slots happens via the context.
 * The root component renders the provider returned by this function and passes the context value to it, as well as any slots or children it receives.
 * The provider then renders the children of the root component using {@link SlotsView}.
 * Slots can then use the hook to retrieve the context value from the root component.
 * 
 * @see {@link SlotsView}
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
 * const DEFAULT_SLOTS = { Slot: MyDefaultSlot };
 * 
 * // This is the root component.
 * function MyComponent({ children, ...slots }: PropsWithSlots<{ Slot: FC }>) {
 * 	const [value, setValue] = useState("No value set");
 * 	const context = useMemo(() => ({ value, setValue }), [value]);
 * 
 * 	return <SlotsProvider
 * 	  context={context}
 * 	  defaults={DEFAULT_SLOTS}
 * 	  slots={slots}
 * 	>
 * 		{children}
 * 	</SlotsProvider>;
 * }
 * ```
 * We use `useMemo()` here to avoid re-rendering all slots on every re-render of `<MyComponent/>`.
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

	const useSlotsContext: SlotSystem<C>["useSlotsContext"] = () => {
		const context = useContext(Context);
		if (context === NO_CONTEXT)
			throw new Error(`${name} slots must be rendered inside ${name} to read from its context, because there is no default value.`);
		return context;
	};

	const SlotsProvider: SlotSystem<C>["SlotsProvider"] = ({ context, defaults, slots, layout, children }) => {
		return <Context.Provider value={context}>
			<SlotsView defaults={defaults} slots={slots} layout={layout}>{children}</SlotsView>
		</Context.Provider>;
	};

	return {
		useSlotsContext,
		SlotsProvider,
	};
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
export function attachSlots<T extends FC<Record<string, FC>>, S extends Record<string, FC> = InferSlots<ComponentProps<T>>>(root: T, slots: S, name?: string): T & S
/**
 * @inheritdoc attachSlots
 */
export function attachSlots<T extends FC, S extends Record<string, FC>>(root: T, slots: S, name?: string): T & S
export function attachSlots<T extends FC, S extends Record<string, FC>>(root: T, slots: S, name?: string): T & S {
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
 * @see {@link SlotsView}
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
