import { test } from "../..";
import { formatShortcut } from "../../../src/features";

test.simpleCases(formatShortcut, [
	[["a"], "A"],
	[["b"], "B"],
	[["c"], "C"],
	[["A"], "A"],
	[["B"], "B"],
	[["C"], "C"],
	[["0"], "0"],
	[["1"], "1"],
	[["2"], "2"],
	[["a", "1"], "A+1"],
	[["b", "2"], "B+2"],
	[["c", "3"], "C+3"],
	[["Alt", "F4"], "Alt+F4"],
	[["c", "Control"], "Ctrl+C"],
	[["Control", "v"], "Ctrl+V"],
	[["a", "1", "Control", "Shift"], "Ctrl+Shift+A+1"],
	[["+", "Shift"], "Shift+Plus"],
	[["-", "Shift"], "Shift+Minus"],
]);