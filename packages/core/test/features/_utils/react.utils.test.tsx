import { test } from "../..";
import { isEmpty } from "../../../src/features";

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
	[<></>, false],
	[<div></div>, false],
	[[<div></div>], false],
	[<><div></div></>, false],
]);