import { test } from "../..";
import { formatTime } from "../../../src/features";

test.cases(formatTime, [
	[[1000], "1 second"],
	[[1000, 1, true], "in 1 second"],
	[[-1000, 1, true], "1 second ago"],
	[[2000], "2 seconds"],
	[[2000, 1, true], "in 2 seconds"],
	[[-2000, 1, true], "2 seconds ago"],
	// TO DO: Add cases for other units of time
]);