import { inspect, inspectArray, inspectObject, InspectionOptions, inspectReactElement, inspectString } from "../../../src/features";
import { mockComponent, mockElement, mockFragment } from "./react.utils";
import { test } from "../..";
import { describe, expect } from "vitest";

test.cases(inspect, [
	[[null, { colors: false }], "null"],
	[[undefined, { colors: false }], "undefined"],
	[[0, { colors: false }], "0"],
	[[1, { colors: false }], "1"],
	[[1.25, { colors: false }], "1.25"],
	[[-10, { colors: false }], "-10"],
	[[NaN, { colors: false }], "NaN"],
	[[Infinity, { colors: false }], "Infinity"],
	[[-Infinity, { colors: false }], "-Infinity"],
	[[Symbol("foo"), { colors: false }], "Symbol(foo)"],
	[[new Date("1970-01-01T00:00:00.000Z"), { colors: false }], "1970-01-01T00:00:00.000Z"],
	[[/^foo(.*)bar$/g, { colors: false }], "/^foo(.*)bar$/g"],
	[[Promise.resolve(), { colors: false }], "Promise { <pending> }"],
]);

test.cases(inspectString, [
	[["foo", { colors: false }], "\"foo\""],
	[["foo", { colors: false, singleQuotes: true }], "'foo'"],
	[["foo'bar", { colors: false, singleQuotes: true }], "'foo\\'bar'"],
	[["abcdefg", { colors: false, maxStringLength: 3 }], "\"abc\"..."],
]);

test.cases(inspectArray, [
	[[[1, 2, 3], { colors: false }], "[1, 2, 3]"],
	[[["foo", "bar"], { colors: false }], "[\"foo\", \"bar\"]"],
]);

test.cases(inspectObject, [
	[[{ foo: "bar" }, { colors: false }], "{ foo: \"bar\" }"],
	[[{ b: false, c: true, a: true }, { colors: false, sortKeys: true }], "{ a: true, b: false, c: true }"],
	[[{ outer: { inner: true } }, { colors: false }], "{ outer: { inner: true } }"],
	[[{ outer: { inner: true } }, { colors: false, depth: 0 }], "{ outer: [Object] }"],
]);

test.cases(inspectReactElement, [
	[[mockElement({ type: "div" }), { colors: false }], "<div/>"],
	[[mockElement({ type: "div", props: { children: ["Hello world"] } }), { colors: false }], "<div>Hello world</div>"],
	[[mockElement({ type: "div", props: { children: [{ type: "div" }] } }), { colors: false }], "<div><div/></div>"],
	[[mockFragment(), { colors: false }], "<></>"],
	[[mockFragment({ props: { children: [{ type: "div" }] } }), { colors: false }], "<><div/></>"],
	[[mockComponent({ name: "Component" }), { colors: false }], "<Component/>"],
	[[mockComponent({ name: "Component", props: { foo: "bar" } }), { colors: false }], "<Component foo={\"bar\"}/>"],
]);

describe("inspectting plugins", () => {
	test("are executed before every inspect function", () => {
		let count = 0;
		const options: InspectionOptions = {
			plugins: [{
				name: "plugin",
				first: () => (++count).toString(),
			}],
		};

		expect(inspect(null, options)).toBe("1");
		expect(inspect(0, options)).toBe("2");
		expect(inspectString("not-plugin", options)).toBe("3");
		expect(inspectArray([1, 2, 3], options)).toBe("4");
		expect(inspectObject({ foo: "bar" }, options)).toBe("5");
		expect(inspectReactElement(mockFragment(), options)).toBe("6");
		expect(count).toBe(6);
	});

	test("can target a specific type of value", () => {
		let count = 0;
		const options: InspectionOptions = {
			colors: false,
			plugins: [{
				name: "plugin",
				first: (value) => {
					if (typeof value === "string")
						return (++count).toString();
				},
			}],
		};

		expect(inspect(null, options)).toBe("null");
		expect(inspect(0, options)).toBe("0");
		expect(inspectString("not-plugin", options)).toBe("1");
		expect(inspectArray([1, 2, 3], options)).toBe("[1, 2, 3]");
		expect(inspectArray(["a", "b", "c"], options)).toBe("[2, 3, 4]");
		expect(inspectObject({ foo: "bar" }, options)).toBe("{ foo: 5 }");
		expect(inspectReactElement(mockFragment(), options)).toBe("<></>");
		expect(count).toBe(5);
	});
});

