import { Assertion, expect, TestAPI } from "vitest";
import { formatFunctionCall, FormatOptions } from "@prozilla-os/shared/logging";

const THROWS = Symbol("throws");
const VERIFY = Symbol("verify");

export interface ThrowsExpectation {
    readonly [THROWS]: true;
    readonly error: new (...args: unknown[]) => Error;
    readonly message?: string | RegExp;
}

export interface VerifyExpectation<R> {
    readonly [VERIFY]: true;
    readonly assert: (actual: Assertion<R>) => void;
}

export type Expectation<R = undefined> = R | ThrowsExpectation | VerifyExpectation<R>;

/**
 * Configuration options for the {@link CustomTestAPI}.
 */
export interface CustomTestConfig {
	/** Options for the formatting of test names. */
	format?: FormatOptions;
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
	simpleCases: <A = unknown, R = undefined>(func: (arg: A) => R, cases: [A, Expectation<R>][]) => void;
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
	cases: <A extends unknown[] = [], R = undefined>(func: (...args: A) => R, cases: [A, Expectation<R>][]) => void;
}

/**
 * The combination of Vitest's {@link TestAPI} and the {@link CustomTestAPI}.
 */
export type ExtendedTestAPI<ExtraContext = object> = TestAPI<ExtraContext> & CustomTestAPI;

/**
 * Extends Vitest's {@link TestAPI} with functions from the {@link CustomTestAPI}.
 * @param test - The Vitest test API.
 * @param config - The configuration options.
 * @returns The extended test API.
 * @example
 * You can call this function in one file and export the result.
 * ```ts
 * // index.ts
 * import { test as base } from "vitest";
 * 
 * export const test = extend(base);
 * ```
 * Then import and use it across your test files.
 * ```ts
 * // isEven.test.ts
 * import { test } from "./index";
 * 
 * test.simpleCases(isEven, [
 * 	[0, true],
 * 	[1, false],
 * 	[2, true],
 * ]);
 * ```
 * ### Config
 * ```ts
 * import { test as base } from "vitest";
 * 
 * export const test = extend(base, {
 * 	format: {
 * 		colors: false,
 * 	},
 * });
 * ```
 */
export function extend<C = object>(test: TestAPI<C>, config: CustomTestConfig = {}): ExtendedTestAPI<C> {
	return Object.assign(test, {
		simpleCases: (func, cases) => testSimpleCases(test, func, cases, config),
		cases: (func, cases) => testCases(test, func, cases, config),
	} satisfies CustomTestAPI);
}

export function throws(error: new (...args: unknown[]) => Error, message?: string | RegExp): ThrowsExpectation {
	return { [THROWS]: true, error, message };
}

export function verify<R>(assert: (actual: Assertion<R>) => void): VerifyExpectation<R> {
	return { [VERIFY]: true, assert };
}

function testSimpleCases<C = object, A = unknown, R = undefined>(test: TestAPI<C>, func: (arg: A) => R, cases: [A, Expectation<R>][], config: Readonly<CustomTestConfig>) {
	return testCases(test, func, cases.map(([arg, expected]) => [[arg], expected]), config);
}

function testCases<C = object, A extends unknown[] = [], R = undefined>(test: TestAPI<C>, func: (...args: A) => R, cases: [A, Expectation<R>][], config: Readonly<CustomTestConfig>) {
	return test.each(
		cases.map(([args, expected]) => [
			formatFunctionCall(func, args, expected, config.format),
			args,
			expected,
		])
	)("%s", (_title, args, expected) => {
		if (isThrowsExpectation(expected)) {
			let caught: unknown;
			try {
				func(...args);
			} catch (e) {
				caught = e;
			}
			expect(caught).toBeInstanceOf(expected.error);
			if (expected.message !== undefined)
				expect((caught as Error).message).toMatch(expected.message);
		} else {
			const actual = expect(func(...args));
			if (isVerifyExpectation(expected)) {
				expected.assert(actual);
			} else if (expected !== null && typeof expected === "object") { // Object or array
				actual.toStrictEqual(expected);
			} else {
				actual.toBe(expected);
			}
		}
	});
}

function isThrowsExpectation(value: unknown): value is ThrowsExpectation {
	return typeof value === "object" && value !== null && THROWS in value;
}

function isVerifyExpectation<R>(value: unknown): value is VerifyExpectation<R> {
	return typeof value === "object" && value !== null && VERIFY in value;
}