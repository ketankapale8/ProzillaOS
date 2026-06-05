import { Assertion, expect, TestAPI } from "vitest";
import { formatFunctionCall, FormatOptions, Ansi, format, formatFunction, FormatPlugin } from "@prozilla-os/shared/logging";
import { mergeDeep } from "@prozilla-os/shared/utils";

const MATCH_ERROR = Symbol("matchError");
const MATCH_ASSERTION = Symbol("matchAssertion");

/**
 * Defines the matching criteria for a test case that expects the function to throw an error.
 * @see {@link Matcher}
 * @see {@link CustomTestAPI.throws}
 */
export interface ErrorMatcher {
    readonly [MATCH_ERROR]: true;
	/** The type of error the function should throw. */
    readonly error: new (...args: never[]) => Error;
	/** The message the error thrown by the function should have. */
    readonly message?: string | RegExp;
}

/**
 * Defines the matching criteria for a test case using an assertion.
 * @see {@link Matcher}
 * @see {@link CustomTestAPI.assert}
 */
export interface AssertionMatcher<R> {
    readonly [MATCH_ASSERTION]: true;
	/** The assertion that defines the matching criteria for this test. */
    readonly assert: (actual: Assertion<R>) => void;
	/** The name of this assertion. */
	readonly name?: string;
}

/**
 * Defines the matching criteria for a test case.
 * 
 * This can either be a plain return value, in which case the test will fail if the function returns a different value,
 * or more complex criteria that determines whether the test will fail. 
 * E.g., an {@link ErrorMatcher} will fail if the function does not throw an error of a certain type and with a certain message.
 * @param R - The type of value the function being tested returns.
 * @see {@link CustomTestAPI.cases}
 */
export type Matcher<R = undefined> = R | ErrorMatcher | AssertionMatcher<R>;

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
	 * @param cases - An array of tuples. Each tuple consisting of a parameter and the corresponding matching criteria.
	 * @typeParam A - The type of parameter the function accepts.
	 * @typeParam R - The type of value the function returns.
	 * @example
	 * test.simpleCases(isEven, [
	 * 	[0, true],
	 * 	[1, false],
	 * 	[2, true],
	 * ]);
	 */
	simpleCases: <A = unknown, R = undefined>(func: (arg: A) => R, cases: [A, Matcher<R>][]) => void;
	/**
	 * A shorthand for {@link CustomTestAPI.case} that tests a function with a single parameter.
	 * @param func - The function to test.
	 * @param arg - The parameter to pass to the function.
	 * @param matcher - The matching criteria.
	 * @typeParam A - The type of parameter the function accepts.
	 * @typeParam R - The type of value the function returns.
	 */
	simpleCase: <A = unknown, R = undefined>(func: (arg: A) => R, arg: A, matcher: Matcher<R>) => void;
	/**
	 * Tests each case in the array by calling the function with the first element of the tuple and checking its behaviour
	 * or return value against the matching criteria in the second element.
	 * 
	 * This is a wrapper around {@link TestAPI.each} that handles test naming, function calling and assertions for you, 
	 * so you can write more parameterized tests with less code.
	 * @param func - The function to test.
	 * @param cases - An array of tuples. Each tuple consisting of an array of parameters and the corresponding matching criteria.
	 * @typeParam A - The types of parameters the function accepts.
	 * @typeParam R - The type of value the function returns.
	 * @example
	 * test.cases(isEqual, [
	 * 	[[0, 1], false],
	 * 	[[2, 3], false],
	 * 	[[4, 4], true],
	 * ]);
	 */
	cases: <A extends unknown[] = [], R = undefined>(func: (...args: A) => R, cases: [A, Matcher<R>][]) => void;
	/**
	 * Tests a single case by calling the function with the given parameters and checking its behaviour
	 * or return value against the matching criteria.
	 * 
	 * This is the equivalent of {@link CustomTestAPI.cases}, but for a single test case.
	 * @param func - The function to test.
	 * @param args - The parameters to pass to the function.
	 * @param matcher - The matching criteria.
	 * @typeParam A - The types of parameters the function accepts.
	 * @typeParam R - The type of value the function returns.
	 */
	case: <A extends unknown[] = [], R = undefined>(func: (...args: A) => R, args: A, matcher: Matcher<R>) => void;
	/**
	 * Creates matching criteria for a test case that expects an error to be thrown.
	 * @param error - The type of error to expect.
	 * @param message - The error message to expect.
	 * @see {@link CustomTestAPI.cases}
	*/
	throws: (error: new (...args: never[]) => Error, message?: string | RegExp) => ErrorMatcher;
	/**
	 * Creates matching criteria for a test case where the actual value is verified by the given assertion, 
	 * instead of simply being compared with an expected return value.
	 * @param assert - The function that verifies the actual return value.
	 * @param name - The name of the assertion.
	 * @see {@link CustomTestAPI.cases}
	*/
	assert: <R>(assert: (actual: Assertion<R>) => void, name?: string) => AssertionMatcher<R>;
	/** Creates matching criteria for a test case that expects the actual value to be nullish (`null` or `undefined`). */
	nullish: <R>() => AssertionMatcher<R>;
	/** Creates matching criteria for a test case that expects the actual value to be [`falsy`](https://developer.mozilla.org/en-US/docs/Glossary/Falsy). */
	falsy: <R>() => AssertionMatcher<R>;
	/** Creates matching criteria for a test case that expects the actual value to be [`truthy`](https://developer.mozilla.org/en-US/docs/Glossary/Truthy). */
	truthy: <R>() => AssertionMatcher<R>;
	/** Negates the proceding matching criteria for a test case. */
	not: Pick<CustomTestAPI, "nullish" | "falsy" | "truthy">;
}

/**
 * The combination of Vitest's {@link TestAPI} and the {@link CustomTestAPI}.
 */
export type ExtendedTestAPI<ExtraContext = object> = TestAPI<ExtraContext> & CustomTestAPI;

const DEFAULT_CONFIG: Partial<CustomTestConfig> = {
	format: {
		plugins: [testFormatPlugin()],
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
		assert,
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

function testCases<C = object, A extends unknown[] = [], R = undefined>(test: TestAPI<C>, func: (...args: A) => R, cases: [A, Matcher<R>][], config: Readonly<CustomTestConfig>) {
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

function testCase<C = object, A extends unknown[] = [], R = undefined>(test: TestAPI<C>, func: (...args: A) => R, args: A, expected: Matcher<R>, config: Readonly<CustomTestConfig>) {
	return test(formatFunctionCall(func, args, expected, config.format), () => {
		testFunction(func, args, expected);
	});
}

function testFunction<A extends unknown[] = [], R = undefined>(func: (...args: A) => R, args: A, matcher: Matcher<R>) {
	if (isErrorMatcher(matcher)) {
		let caught: unknown;
		try {
			func(...args);
		} catch (e) {
			caught = e;
		}
		expect(caught).toBeInstanceOf(matcher.error);
		if (matcher.message !== undefined)
			expect((caught as Error).message).toMatch(matcher.message);
	} else {
		const actual = expect(func(...args));
		if (isAssertionMatcher(matcher)) {
			matcher.assert(actual);
		} else if (matcher !== null && typeof matcher === "object") { // Object or array
			actual.toStrictEqual(matcher);
		} else {
			actual.toBe(matcher);
		}
	}
}

const throws: CustomTestAPI["throws"] = (error, message) => ({ [MATCH_ERROR]: true, error, message });
const assert: CustomTestAPI["assert"] = (assert, name) => ({ [MATCH_ASSERTION]: true, assert, name });
const nullish: CustomTestAPI["falsy"] = () => assert((actual) => actual.toBeNullable(), "to be nullish");
const nonNullish: CustomTestAPI["falsy"] = () => assert((actual) => actual.not.toBeNullable(), "to not be nullish");
const falsy: CustomTestAPI["falsy"] = () => assert((actual) => actual.toBeFalsy(), "to be falsy");
const truthy: CustomTestAPI["falsy"] = () => assert((actual) => actual.toBeTruthy(), "to be truthy");

function isErrorMatcher(value: unknown): value is ErrorMatcher {
	return typeof value === "object" && value !== null && MATCH_ERROR in value;
}

function isAssertionMatcher<R>(value: unknown): value is AssertionMatcher<R> {
	return typeof value === "object" && value !== null && MATCH_ASSERTION in value;
}

function testFormatPlugin(): FormatPlugin {
	return {
		name: "test-format-plugin",
		first: (value, options) => {
			if (isErrorMatcher(value)) {
				const error = (options.colors ? Ansi.red(value.error.name) : value.error.name) + (value.message ? ": " + format(value.message, options) : "");
				return `to throw ${error}`;
			} else if (isAssertionMatcher(value)) {
				return value.name ?? `to match ${formatFunction(value.assert, options)}`;
			}
		},
	};
};