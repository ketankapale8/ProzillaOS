import { Assertion, test as base, describe, expect } from "vitest";
import { extend } from "../../src/features";

/**
 * The tester to test the tester with tests with.
 */
const test = extend(base);

describe("extends Vitest", () => {
	test.skip("skipped test", () => {
		test.fails("failing test");
	});

	test("succeeding test", () => {
		expect(true).toBe(true);
	});

	test.each([
		[true, false],
		[1, 2],
		["foo", "bar"],
	])("%s !== %s", (a, b) => {
		expect(a).not.toBe(b);
	});
});

describe("simpleCases", () => {
	const isEven = (x: number) => x % 2 === 0;

	test.simpleCases(isEven, [
		[0, true],
		[1, false],
		[2, true],
	]);
});

describe("cases", () => {
	describe("with expected values", () => {
		const isEqual = (a: unknown, b: unknown) => a === b;

		test.cases(isEqual, [
			[[0, 1], false],
			[[2, 3], false],
			[[4, 4], true],
		]);
	});

	describe("with throws", () => {
		const parsePositive = (x: number) => {
			if (x <= 0)
				throw new RangeError("Must be positive");
			return x;
		};

		test.cases(parsePositive, [
			[[5], 5],
			[[-1], test.throws(RangeError, "Must be positive")],
			[[-1], test.throws(RangeError, /positive/)],
		]);
	});

	describe("with verify", () => {
		const getArray = () => [1, 2, 3];
		const hasThreeElements = (actual: Assertion<number[]>) => actual.toHaveLength(3);

		test.simpleCases(getArray, [
			[undefined, test.verify(hasThreeElements)],
			[undefined, test.truthy()],
		]);
	});
});