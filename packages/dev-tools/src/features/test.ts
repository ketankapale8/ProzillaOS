import { expect, TestAPI } from "vitest";
import { formatFunctionCall } from "./format";

function testSimpleCases<A = unknown, R = undefined>(test: TestAPI, func: (arg: A) => R, cases: [A, R][]) {
	return testCases(test, func, cases.map(([arg, expected]) => [[arg], expected]));
}

function testCases<A extends unknown[] = [], R = undefined>(test: TestAPI, func: (...args: A) => R, cases: [A, R][]) {
	return test.each(
		cases.map(([args, expected]) => [
			formatFunctionCall(func, args, expected),
			args,
			expected,
		])
	)("%s", (_title, args, expected) => {
		const assertion = expect(func(...args));
		if (typeof expected === "object") { // Object or array
			assertion.toStrictEqual(expected);
		} else {
			assertion.toBe(expected);
		}
	});
}

/**
 * Utility functions built on top of Vitest's API to make writing tests easier.
 * @see {@link extend}
 */
export interface CustomTestAPI {
	/**
	 * A shorthand for {@link CustomTestAPI.cases} that tests a function with a single parameter.
	 * @param func - The function to test.
	 * @param cases - An array of tuples. Each tuple consisting of a parameter and the corresponding expected return value.
	 * @typeParam A - The type of parameter the function accepts.
	 * @typeParam R - The type of value the function returns.
	 * @example
	 * test.simpleCases(isEven, [
	 * 	[0, true],
	 * 	[1, false],
	 * 	[2, true],
	 * ]);
	 */
	simpleCases: <A = unknown, R = undefined>(func: (arg: A) => R, cases: [A, R][]) => void;
	/**
	 * Tests each case in the array by calling the function with the first element of the tuple and comparing the return value with the second element of the tuple.
	 * @param func - The function to test.
	 * @param cases - An array of tuples. Each tuple consisting of an array of parameters and the corresponding expected return value.
	 * @typeParam A - The types of parameters the function accepts.
	 * @typeParam R - The type of value the function returns.
	 * @example
	 * test.cases(isEqual, [
	 * 	[[0, 1], false],
	 * 	[[2, 3], false],
	 * 	[[4, 4], true],
	 * ]);
	 */
	cases: <A extends unknown[] = [], R = undefined>(func: (...args: A) => R, cases: [A, R][]) => void;
}

/**
 * The combination of Vitest's {@link TestAPI} and the {@link CustomTestAPI}.
 */
export type ExtendedTestAPI = TestAPI & CustomTestAPI;

/**
 * Extends Vitest's {@link TestAPI} with functions from the {@link CustomTestAPI}.
 * @param test - The Vitest test API.
 * @returns The extended test API.
 * @example
 * import { test as base } from "vitest";
 * 
 * const test = extend(base);
 */
export function extend(test: TestAPI): ExtendedTestAPI {
	return Object.assign(test, {
		simpleCases: (func, cases) => testSimpleCases(test, func, cases),
		cases: (func, cases) => testCases(test, func, cases),
	} satisfies CustomTestAPI);
}