import { test as base } from "vitest";
import { isEmpty } from "../../../src/features";
import { extend } from "../../../../dev-tools/src/features/test";

const test = extend(base);

test.simpleCases(isEmpty, [
	[null, true],
	[undefined, true],
	["", true],
	[true, true],
	[false, true],
	[[], true],
	[[null], true],
	[[undefined], true],
	[[""], true],
	[[true], true],
	[[false], true],
	[[[]], true],

	[0, false],
	[1, false],
	["foo", false],
	[[0], false],
	[[1], false],
	[["foo"], false],
	[<div></div>, false],
	[[<div></div>], false],
	[<><div></div></>, false],
]);