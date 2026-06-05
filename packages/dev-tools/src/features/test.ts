import { Assertion, expect, TestAPI } from "vitest";
import { formatFunctionCall, FormatOptions } from "@prozilla-os/shared/logging";
import { mergeDeep } from "@prozilla-os/shared/utils";
import { formatFunction } from "@prozilla-os/shared";

const THROWS = Symbol("throws");
const VERIFY = Symbol("verify");

export interface ThrowsExpectation {
    readonly [THROWS]: true;
    readonly error: new (...args: never[]) => Error;
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
	 * Tests each case in the array by calling the function with the first element of the tuple and comparing 
	 * the return value with the second element of the tuple.
	 * 
	 * This is a wrapper around {@link TestAPI.each} that handles test naming, function calling and assertions for you, 
	 * so you can write more parameterized tests with less code.
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
	simpleCase: <A = unknown, R = undefined>(func: (arg: A) => R, arg: A, expected: Expectation<R>) => void;
	case: <A extends unknown[] = [], R = undefined>(func: (...args: A) => R, args: A, expected: Expectation<R>) => void;
	/**
	 * Creates a special case that expects an error to be thrown.
	 * @param error - The type of error to expect.
	 * @param message - The error message to expect.
	 * @see {@link CustomTestAPI.cases}
	*/
	throws: (error: new (...args: never[]) => Error, message?: string | RegExp) => ThrowsExpectation;
	/**
	 * Creates a special case where the actual value is verified by the given assertion, 
	 * instead of simply being compared with an expected return value.
	 * @param assert - The function that verifies the actual return value.
	 * @see {@link CustomTestAPI.cases}
	*/
	verify: <R>(assert: (actual: Assertion<R>) => void) => VerifyExpectation<R>;
	/** Creates a special case that tests if the actual value is nullish (`null` or `undefined`). */
	nullish: <R>() => VerifyExpectation<R>;
	/** Creates a special case that tests if the actual value is [`falsy`](https://developer.mozilla.org/en-US/docs/Glossary/Falsy). */
	falsy: <R>() => VerifyExpectation<R>;
	/** Creates a special case that tests if the actual value is [`truthy`](https://developer.mozilla.org/en-US/docs/Glossary/Truthy). */
	truthy: <R>() => VerifyExpectation<R>;
	/** Negates the proceding test expectation. */
	not: Pick<CustomTestAPI, "nullish" | "falsy" | "truthy">;
}

/**
 * The combination of Vitest's {@link TestAPI} and the {@link CustomTestAPI}.
 */
export type ExtendedTestAPI<ExtraContext = object> = TestAPI<ExtraContext> & CustomTestAPI;

const DEFAULT_CONFIG: Partial<CustomTestConfig> = {
	format: {
		plugins: [(value, options) => {
			if (isThrowsExpectation(value)) {
				return `expected to throw ${value.error.name}${value.message ? ": " + value.message : ""}`;
			} else if (isVerifyExpectation(value)) {
				return `verify with ${formatFunction(value.assert, options)}`;
			}
		}],
	},
};

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
	config = mergeDeep<Partial<CustomTestConfig>>(DEFAULT_CONFIG, config);

	const testCustomCases: CustomTestAPI["cases"] = (func, cases) => testCases(test, func, cases, config);
	const testCustomCase: CustomTestAPI["case"] = (func, args, expected) => testCase(test, func, args, expected, config);

	return Object.assign(test, {
		simpleCases: (func, cases) => testCustomCases(func, cases.map(([arg, expected]) => [[arg], expected])),
		simpleCase: (func, arg, expected) => testCustomCase(func, [arg], expected),
		cases: testCustomCases,
		case: testCustomCase,
		throws,
		verify,
		nullish,
		falsy,
		truthy,
		not: {
			nullish: nonNullish,
			falsy: truthy,
			truthy: falsy,
		},
	} satisfies CustomTestAPI);
}

function testCases<C = object, A extends unknown[] = [], R = undefined>(test: TestAPI<C>, func: (...args: A) => R, cases: [A, Expectation<R>][], config: Readonly<CustomTestConfig>) {
	return test.each(
		cases.map(([args, expected]) => [
			formatFunctionCall(func, args, expected, config.format),
			args,
			expected,
		])
	)("%s", (_title, args, expected) => {
		testFunction(func, args, expected);
	});
}

function testCase<C = object, A extends unknown[] = [], R = undefined>(test: TestAPI<C>, func: (...args: A) => R, args: A, expected: Expectation<R>, config: Readonly<CustomTestConfig>) {
	return test(formatFunctionCall(func, args, expected, config.format), () => {
		testFunction(func, args, expected);
	});
}

function testFunction<A extends unknown[] = [], R = undefined>(func: (...args: A) => R, args: A, expected: Expectation<R>) {
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
}

const throws: CustomTestAPI["throws"] = (error, message) => ({ [THROWS]: true, error, message });
const verify: CustomTestAPI["verify"] = (assert) => ({ [VERIFY]: true, assert });
const nullish: CustomTestAPI["falsy"] = () => verify((actual) => actual.toBeNullable());
const nonNullish: CustomTestAPI["falsy"] = () => verify((actual) => actual.not.toBeNullable());
const falsy: CustomTestAPI["falsy"] = () => verify((actual) => actual.toBeFalsy());
const truthy: CustomTestAPI["falsy"] = () => verify((actual) => actual.toBeTruthy());

function isThrowsExpectation(value: unknown): value is ThrowsExpectation {
	return typeof value === "object" && value !== null && THROWS in value;
}

function isVerifyExpectation<R>(value: unknown): value is VerifyExpectation<R> {
	return typeof value === "object" && value !== null && VERIFY in value;
}