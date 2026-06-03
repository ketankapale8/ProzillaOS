import { expect } from "vitest";
import { MockVirtualFile } from "./virtualDrive.utils";
import { test } from "../..";

test("toJSON()", () => {
	const mockVirtualFileWithContent = new MockVirtualFile("foo", "bar");
	mockVirtualFileWithContent.setContent("Hello world!");
	expect(mockVirtualFileWithContent.toJSON()).toStrictEqual({
		nam: "foo",
		ico: undefined,
		ext: "bar",
		cnt: "Hello world!",
	});

	const mockVirtualFileWithSource = new MockVirtualFile("foo", "bar");
	mockVirtualFileWithSource.setSource("https://example.com/");
	expect(mockVirtualFileWithSource.toJSON()).toStrictEqual({
		nam: "foo",
		ico: undefined,
		ext: "bar",
		src: "https://example.com/",
	});
});

test("isFile()", () => {
	const mockVirtualFile = new MockVirtualFile("foo", "bar");
	expect(mockVirtualFile.isFile()).toBe(true);
});

test("isFolder()", () => {
	const mockVirtualFile = new MockVirtualFile("foo", "bar");
	expect(mockVirtualFile.isFolder()).toBe(false);
});
