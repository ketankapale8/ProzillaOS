---
outline: deep
description: "Learn how to write concise parameterized tests using the dev-tools package"
---

# Writing Tests

The `extend()` function from `@prozilla-os/dev-tools` provides an extension to Vitest's API that makes it easier to write tests.

These utilities can also be used in projects without ProzillaOS. All you need is [Vitest](https://vitest.dev/) and `@prozilla-os/dev-tools`.

Test names are automatically generated using the [inspection utilities](../reference/shared/Functions/inspect) from `@prozilla-os/shared` and can be customized.

## Setup

Create a file that exports your own `test` object:

```ts
// index.ts
import { test as base } from "vitest";
import { extend } from "@prozilla-os/dev-tools";

export const test = extend(base);
```

Then import it in your test files instead of the one from Vitest:

```ts
// isEven.test.ts
import { test } from "./";

function isEven(n: number) {
	return n % 2 === 0;
}

test.simpleCases(isEven, [
	[0, true],
	[1, false],
	[2, true],
]);
```

## Parameterized tests

### Multiple parameters

Use `test.cases()` for functions that take multiple arguments. Each entry pairs an array of arguments with an expected return value:

```ts
// add.test.ts
import { test } from "./";

function add(a: number, b: number): number {
	return a + b;
}

test.cases(add, [
	[[1, 1], 2],
	[[1, 2], 3],
	[[2, 1], 3],
]);
```

### Single parameter

`test.simpleCases()` removes one level of nesting for functions that take a single argument:

```ts
// double.test.ts
import { test } from "./";

function double(n: number): number {
	return n * 2;
}

test.simpleCases(double, [
	[0, 0],
	[1, 2],
	[3, 6],
]);
```

### Single cases

For when you only want to test a single case:

```ts
test.case(add, [1, 1], 2);
test.simpleCase(double, 2, 4);
```

### Comparison with `test.each`

Most functions will have simple unit tests like this:

```ts
test.each([
	[1, 1, 2],
	[1, 2, 3],
	[2, 1, 3],
])("add(%i, %i) -> %i", (a, b, expected) => {
	expect(a + b).toBe(expected);
});
```

This is the same test, but using the `test.cases` wrapper instead:

```ts
test.cases(add, [
	[[1, 1], 2],
	[[1, 2], 3],
	[[2, 1], 3],
]);
```

## Matchers

The matcher is the second element in each test case. It determines how the return value is verified.

### Plain values

If the second element is a plain value, the test will verify if the function returns an equal value.

```ts
test.simpleCases(double, [
	[0, 0],
	[1, 2],
]);

test.cases(add, [
	[[1, 1], 2],
]);
```

### Errors

Use `test.throws()` to assert that a function throws an error:

```ts
// divide.test.ts

function divide(a: number, b: number): number {
	if (b === 0) throw new Error("Division by zero");
	return a / b;
}

test.cases(divide, [
	[[10, 0], test.throws(Error, "Division by zero")],
	[[10, 2], 5],
]);
```

You can check just the error type or the type and message together, and the message can be a regex:

```ts
test.throws(RangeError);
test.throws(Error, /^Invalid/);
```

### Manual assertions

Use `test.assert()` for custom verification logic:

```ts
// getFullName.test.ts

function getFullName(first: string, last: string): string {
	return `${first} ${last}`;
}

test.cases(getFullName, [
	[["John", "Doe"], test.assert((actual) => {
		actual.toContain("John");
		actual.toContain("Doe");
	}, "contains first and last name")],
]);
```

The callback is called with a value of type `Assertion`, which is described in detail in [Vitest's API documentation](https://vitest.dev/api/expect.html).

### Other matchers

There are some other built-in matchers for common assertions.

```ts
// identity.test.ts

function identity<T>(x: T): T {
	return x;
}

test.simpleCases(identity, [
	[undefined, test.nullish()],
	[1, test.truthy()],
	[0, test.falsy()],
	["example", test.not.nullish()],
]);
```

## Configuration

You can pass options to `extend()` to configure how your tests are run:

```ts
import { test as base } from "vitest";
import { extend } from "@prozilla-os/dev-tools";

export const test = extend(base, {
	format: {
		colors: false,
		singleQuotes: true,
		spaceAfterComma: false,
	},
});
```
