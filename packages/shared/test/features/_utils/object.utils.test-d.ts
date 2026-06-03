import { describe, test, expectTypeOf } from "vitest";
import { Merge, MergeValues, MergeObjects, MergeArrays, mergeDeep } from "../../../src/features";

describe("Merge", () => {
	test("no sources returns target object", () => {
		type Result = Merge<{ a: string }, []>;
		expectTypeOf<Result>().toEqualTypeOf<{ a: string }>();
	});

	test("one source object merges with target object", () => {
		type Result = Merge<{ a: string }, [{ b: number }]>;
		expectTypeOf<Result>().toEqualTypeOf<{ a: string; b: number }>();
	});

	test("two source objects chain", () => {
		type Result = Merge<{ a: string }, [{ b: number }, { c: boolean }]>;
		expectTypeOf<Result>().toEqualTypeOf<{ a: string; b: number; c: boolean }>();
	});

	test("later source object overrides earlier", () => {
		type Result = Merge<{ a: string }, [{ a: number }, { a: boolean }]>;
		expectTypeOf<Result>().toEqualTypeOf<{ a: boolean }>();
	});

	test("complex objects merge", () => {
		type Target = { a: string, b: number, c: [{ foo: "bar" }] };
		type SourceA = { b: () => void, c: [{ bar: "foo" }], d: string, e: { foo: boolean, bar: [1] } };
		type SourceB = { a: undefined, c: [], e: { foo: true, bar: [2, 3] } };
		type Result = Merge<Target, [SourceA, SourceB]>;
		expectTypeOf<Result>().toEqualTypeOf<{ a: string, b: () => void, c: [{ foo: "bar" }, { bar: "foo" }], d: string, e: { foo: true, bar: [1, 2, 3] } }>();
	});

	test("non-tuple array sources produces union", () => {
		type Result = Merge<{ a: string }, { b: number }[]>;
		expectTypeOf<Result>().toEqualTypeOf<{ a: string } | { a: string; b: number }>();
	});
});

describe("MergeValues", () => {
	test("two objects merge", () => {
		expectTypeOf<MergeValues<{ a: string }, { b: number }>>().toEqualTypeOf<{ a: string; b: number }>();
	});

	test("three objects merge", () => {
		type Result = MergeValues<MergeValues<{ a: string }, { b: number }>, { c: boolean }>;
		expectTypeOf<Result>().toEqualTypeOf<{ a: string; b: number; c: boolean }>();
	});

	test("source object overrides target object with same key", () => {
		type Result = MergeValues<{ a: string }, { a: number }>;
		expectTypeOf<Result>().toEqualTypeOf<{ a: number }>();
	});

	test("source overrides target if not undefined", () => {
		expectTypeOf<MergeValues<string, number>>().toEqualTypeOf<number>();
	});

	test("source does not override target if undefined", () => {
		expectTypeOf<MergeValues<string, undefined>>().toEqualTypeOf<string>();
	});

	test("source does not override target if possibly undefined", () => {
		expectTypeOf<MergeValues<string, string | undefined>>().toEqualTypeOf<string>();
	});

	test("source overrides target if target is undefined", () => {
		expectTypeOf<MergeValues<undefined, number>>().toEqualTypeOf<number>();
	});

	test("two arrays concatenate", () => {
		type Result = MergeValues<[1, 2], [3, 4]>;
		expectTypeOf<Result>().toEqualTypeOf<[1, 2, 3, 4]>();
	});

	test("partial source object does not override target object", () => {
		type Result = MergeValues<{ install: string }, { install?: string }>;
		expectTypeOf<Result>().toEqualTypeOf<{ install: string }>();
	});

	test("partial source object does not override or narrow target object", () => {
		type Default = { install: string; uninstall: string };
		type Override = { install?: string };
		type Result = MergeValues<Default, Override>;
		expectTypeOf<Result>().toEqualTypeOf<{ install: string; uninstall: string }>();
	});

	test("source overrides undefined default value", () => {
		type Result = MergeValues<{ foo: undefined }, { foo: boolean }>;
		expectTypeOf<Result>().toEqualTypeOf<{ foo: boolean }>();
	});
});

describe("MergeObjects", () => {
	test("non-overlapping keys combine", () => {
		type Result = MergeObjects<{ a: string }, { b: number }>;
		expectTypeOf<Result>().toEqualTypeOf<{ a: string; b: number }>();
	});

	test("overlapping keys merge values", () => {
		type Result = MergeObjects<{ a: { b: string } }, { a: { c: number } }>;
		expectTypeOf<Result>().toEqualTypeOf<{ a: { b: string; c: number } }>();
	});

	test("source key overrides target key", () => {
		type Result = MergeObjects<{ a: string }, { a: number }>;
		expectTypeOf<Result>().toEqualTypeOf<{ a: number }>();
	});

	test("source overrides undefined default value", () => {
		type Result = MergeObjects<{ foo: undefined }, { foo: boolean }>;
		expectTypeOf<Result>().toEqualTypeOf<{ foo: boolean }>();
	});
});

describe("MergeArrays", () => {
	test("concatenates two arrays", () => {
		type Result = MergeArrays<[1, 2], [3, 4]>;
		expectTypeOf<Result>().toEqualTypeOf<[1, 2, 3, 4]>();
	});

	test("empty arrays", () => {
		expectTypeOf<MergeArrays<[], []>>().toEqualTypeOf<[]>();
	});

	test("mixed types", () => {
		type Result = MergeArrays<[string, string], [number]>;
		expectTypeOf<Result>().toEqualTypeOf<[string, string, number]>();
	});

	test("arrays with fixed lengths", () => {
		type Result = MergeArrays<[string, string], [string]>;
		expectTypeOf<Result>().toEqualTypeOf<[string, string, string]>();
	});

	test("arrays with variable lengths", () => {
		type Result = MergeArrays<string[], string[]>;
		expectTypeOf<Result>().toEqualTypeOf<string[]>();
	});

	test("arrays with variable lengths and different types", () => {
		type Result = MergeArrays<string[], number[]>;
		expectTypeOf<Result>().toEqualTypeOf<(string | number)[]>();
	});
});

describe("mergeDeep", () => {
	test("overrides undefined property", () => {
		const result = mergeDeep({ foo: undefined, bar: 1 }, { foo: "hello" });
		expectTypeOf(result).toEqualTypeOf<{ foo: string; bar: number }>();
	});

	test("merges nested objects recursively", () => {
		const result = mergeDeep(
			{ nested: { a: 1, b: "hello" } },
			{ nested: { a: 2, c: true } }
		);
		expectTypeOf(result).toEqualTypeOf<{ nested: { a: number; b: string; c: boolean } }>();
	});

	test("merges arrays", () => {
		const result = mergeDeep({ items: ["a", "b"] }, { items: ["c"] });
		expectTypeOf(result).toEqualTypeOf<{ items: string[] }>();
	});

	test("merges arrays with mixed types", () => {
		const result = mergeDeep({ items: ["a", "b"] }, { items: [3] });
		expectTypeOf(result).toEqualTypeOf<{ items: (string | number)[] }>();
	});
	
	test("merges tuples", () => {
		const result = mergeDeep({ items: ["a", "b"] satisfies ["a", "b"] }, { items: [3] satisfies [3] });
		expectTypeOf(result).toEqualTypeOf<{ items: ["a", "b", 3] }>();
	});

	test("merges target with array of sources", () => {
		const sources = [{ a: "2", c: true }, { a: "5", c: false }];
		const result = mergeDeep({ a: 1, b: "hello" }, ...sources);
		expectTypeOf(result).toEqualTypeOf<{ a: number, b: string } | { a: string, b: string, c: boolean }>();
	});
});