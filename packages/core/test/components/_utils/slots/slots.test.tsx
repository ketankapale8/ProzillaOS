import { describe, expect, test } from "vitest";
import { render, renderHook } from "@testing-library/react";
import { type FC } from "react";
import { createSlots, attachSlots, Slot } from "../../../../src/components/";

describe("createSlots", () => {
	describe("useSlotsContext", () => {
		test("returns context value inside SlotsProvider", () => {
			const { useSlotsContext, SlotsProvider } = createSlots<{ value: string }>("Test");

			function Slot() {
				const { value } = useSlotsContext();
				return <div>{value}</div>;
			}

			const { container } = render(
				<SlotsProvider context={{ value: "foo" }} defaults={{ Slot }} slots={{}}/>
			);

			expect(container.textContent).toBe("foo");
		});

		test("throws error when used outside provider without default value", () => {
			const { useSlotsContext } = createSlots<{ value: string }>("Test");
			expect(() => renderHook(() => useSlotsContext())).toThrow(/must be rendered inside.*no default value/);
		});

		test("returns default value when used outside provider with default", () => {
			const { useSlotsContext } = createSlots<{ value: string }>("Test", { value: "foo" });
			const { result } = renderHook(() => useSlotsContext());
			expect(result.current).toEqual({ value: "foo" });
		});
	});

	describe("SlotsProvider", () => {
		test("renders default slot when no children", () => {
			const { useSlotsContext, SlotsProvider } = createSlots<{ value: string }>("Test");

			function DefaultSlot() {
				const { value } = useSlotsContext();
				return <span>{value}</span>;
			}

			const { container } = render(
				<SlotsProvider context={{ value: "foo" }} defaults={{ Slot: DefaultSlot }} slots={{}}/>
			);

			expect(container.textContent).toBe("foo");
		});

		test("renders children instead of slots when children are non-empty", () => {
			const { useSlotsContext, SlotsProvider } = createSlots<{ value: string }>("Test");

			function DefaultSlot() {
				const { value } = useSlotsContext();
				return <span>{value}</span>;
			}

			const { container } = render(
				<SlotsProvider context={{ value: "foo" }} defaults={{ Slot: DefaultSlot }} slots={{}}>
					<div>bar</div>
				</SlotsProvider>
			);

			expect(container.textContent).toBe("bar");
		});

		test.each([null, undefined, "", true, false])("renders slots when children are empty (%s)", (child) => {
			const { useSlotsContext, SlotsProvider } = createSlots<{ value: string }>("Test");

			function DefaultSlot() {
				const { value } = useSlotsContext();
				return <span>{value}</span>;
			}

			const { container } = render(
				<SlotsProvider context={{ value: "foo" }} defaults={{ Slot: DefaultSlot }} slots={{}}>
					{child}
				</SlotsProvider>
			);

			expect(container.textContent).toBe("foo");
		});

		test("renders custom slot when override is provided", () => {
			const { useSlotsContext, SlotsProvider } = createSlots<{ value: string }>("Test");

			function DefaultSlot() {
				const { value } = useSlotsContext();
				return <span>{value}</span>;
			}

			function CustomSlot() {
				const { value } = useSlotsContext();
				return <span>{value.toUpperCase()}</span>;
			}

			const { container } = render(
				<SlotsProvider context={{ value: "foo" }} defaults={{ Slot: DefaultSlot }} slots={{ renderSlot: CustomSlot }} />
			);

			expect(container.textContent).toBe("FOO");
		});

		test("falls back to default slot when override is not provided for that slot", () => {
			const { useSlotsContext, SlotsProvider } = createSlots<{ a: string; b: string }>("Test");

			function DefaultA() {
				const { a } = useSlotsContext();
				return <span>{a}</span>;
			}

			function DefaultB() {
				const { b } = useSlotsContext();
				return <span>{b}</span>;
			}

			function CustomA() {
				const { a } = useSlotsContext();
				return <span>{a.toUpperCase()}</span>;
			}

			const { container } = render(
				<SlotsProvider
					context={{ a: "foo", b: "bar" }}
					defaults={{ A: DefaultA, B: DefaultB }}
					slots={{ renderA: CustomA }}
				/>
			);

			expect(container.textContent).toBe("FOObar");
		});

		test("renders multiple slots in order", () => {
			const { useSlotsContext, SlotsProvider } = createSlots<{ items: string[] }>("Test");

			function SlotA() {
				const { items } = useSlotsContext();
				return <span>{items[0]}</span>;
			}

			function SlotB() {
				const { items } = useSlotsContext();
				return <span>{items[1]}</span>;
			}

			const { container } = render(
				<SlotsProvider context={{ items: ["foo", "bar"] }} defaults={{ A: SlotA, B: SlotB }} slots={{}}/>
			);

			expect(container.textContent).toBe("foobar");
		});

		test("allows Slot.Empty to hide a slot", () => {
			const { useSlotsContext, SlotsProvider } = createSlots<{ items: string[] }>("Test");

			function SlotA() {
				const { items } = useSlotsContext();
				return <span>{items[0]}</span>;
			}

			function SlotB() {
				const { items } = useSlotsContext();
				return <span>{items[1]}</span>;
			}

			const { container } = render(
				<SlotsProvider
					context={{ items: ["foo", "bar"] }}
					defaults={{ A: SlotA, B: SlotB }}
					slots={{ renderA: Slot.Empty }}
				/>
			);

			expect(container.textContent).toBe("bar");
		});
	});
});

describe("attachSlots", () => {
	test("attaches slots as properties on root", () => {
		const Root: FC = () => null;
		const SlotA: FC = () => null;
		const SlotB: FC = () => null;
		const Result = attachSlots(Root, { SlotA, SlotB }, "Root");
		expect(Result.SlotA).toBe(SlotA);
		expect(Result.SlotB).toBe(SlotB);
		expect(Result).toBe(Root);
	});

	test("sets displayName on root when name is provided", () => {
		const Root: FC = () => null;
		attachSlots(Root, {}, "CustomName");
		expect(Root.displayName).toBe("CustomName");
	});

	test("sets displayName on unnamed slots", () => {
		const Root: FC = () => null;
		const Slot: FC = () => null;
		attachSlots(Root, { Slot }, "Root");
		expect(Slot.displayName).toBe("Root.Slot");
	});

	test("does not override existing displayName on slots", () => {
		const Root: FC = () => null;
		const SlotA: FC = () => null;
		SlotA.displayName = "ExistingName";
		attachSlots(Root, { SlotA }, "Root");
		expect(SlotA.displayName).toBe("ExistingName");
	});

	test("falls back to displayName", () => {
		const Root: FC = () => null;
		Root.displayName = "MyRoot";
		const Slot: FC = () => null;
		attachSlots(Root, { Slot });
		expect(Root.displayName).toBe("MyRoot");
		expect(Slot.displayName).toBe("MyRoot.Slot");
	});

	test("falls back to function name", () => {
		function Root() { return null; }
		const Slot: FC = () => null;
		const Result = attachSlots<FC, { Slot: FC }>(Root, { Slot });
		expect(Result.displayName).toBe("Root");
		expect(Slot.displayName).toBe("Root.Slot");
	});

	test("works with no slots", () => {
		const Root: FC = () => null;
		const Result = attachSlots(Root, {}, "Root");
		expect(Result).toBe(Root);
		expect(Root.displayName).toBe("Root");
	});

	test("works with empty slots", () => {
		const Root: FC = () => null;
		const expected = Slot.Empty.displayName;
		const Result = attachSlots(Root, { Slot: Slot.Empty }, "MyRoot");
		expect(Result.displayName).toBe("MyRoot");
		expect(Result.Slot.displayName).toBe(expected);
		expect(Slot.Empty.displayName).toBe(expected);
	});
});

describe("Slot", () => {
	describe("Empty", () => {
		test("has displayName", () => {
			expect(Slot.Empty.displayName).toBe("Empty");
		});
	});
});