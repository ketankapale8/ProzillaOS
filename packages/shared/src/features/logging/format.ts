import { ANSI } from "../../constants";
import { Ansi } from "./ansi";
import { isObject } from "../_utils";

const CONTEXT = Symbol("formatContext");
const REACT_ELEMENT = Symbol.for("react.element");
const REACT_FRAGMENT = Symbol.for("react.fragment");

/**
 * Configuration options for formatting functions.
 * @see {@link format}
 */
export interface FormatOptions {
	/**
	 * `true` enables ANSI colors in the formatted string.
	 * @default true
	 */
	colors?: boolean;
	/**
	 * The maximum depth for representations of container values (e.g., objects, arrays).
	 * @default 2
	 */
	depth?: number;
	/**
	 * The maximum number of array elements to represent before truncating.
	 * @default 100
	 */
	maxArrayLength?: number;
	/**
	 * The maximum amount of characters of a string to represent, before replacing the remainder with an ellipsis.
	 * @default 80
	 */
	maxStringLength?: number;
	/**
	 * The maximum line length before wrapping to a new line.
	 * 
	 * This option is ignored when {@link compact} is set to `true`.
	 * @default 60
	 */
	breakLength?: number;
	/**
	 * `true` keeps container values on a single line when possible.
	 * @default true
	 */
	compact?: boolean;
	/**
	 * `true` enables the sorting of keys in object representations.
	 * @default false
	 */
	sortKeys?: boolean;
	/**
	 * `true` uses single quotes instead of double quotes.
	 * @default false
	 */
	singleQuotes?: boolean;
	/**
	 * `true` places a space after every comma.
	 * @default true
	 */
	spaceAfterComma?: boolean;
	stringColor?: string | null;
	numberColor?: string | null;
	booleanColor?: string | null;
	nullColor?: string | null;
	undefinedColor?: string | null;
	bigintColor?: string | null;
	symbolColor?: string | null;
	functionColor?: string | null;
	keyColor?: string | null;
	dateColor?: string | null;
	regexpColor?: string | null;
	errorColor?: string | null;
	htmlTagColor?: string | null;
	reactComponentColor?: string | null;
	delimiterColor?: string | null;
}

type NormalizedFormatOptions = Required<FormatOptions>;
interface FormatContext extends NormalizedFormatOptions {
	[CONTEXT]: true;
	currentDepth: number;
	seen: WeakSet<object>;
	delimiter: (delimiter: string) => string;
	separator: () => string;
}

export interface ReactElementLike {
	type: unknown;
	props?: unknown;
	key?: string | null;
}

const DEFAULT_OPTIONS: NormalizedFormatOptions = {
	colors: true,
	depth: 2,
	maxArrayLength: 100,
	maxStringLength: 80,
	breakLength: 60,
	compact: true,
	sortKeys: false,
	singleQuotes: false,
	spaceAfterComma: true,
	stringColor: ANSI.fg.green,
	numberColor: ANSI.fg.yellow,
	booleanColor: ANSI.fg.yellow,
	nullColor: ANSI.decoration.dim + ANSI.fg.yellow,
	undefinedColor: ANSI.decoration.dim + ANSI.fg.yellow,
	bigintColor: ANSI.fg.yellow,
	symbolColor: ANSI.fg.green,
	functionColor: ANSI.fg.blue,
	keyColor: ANSI.fg.white,
	dateColor: ANSI.fg.magenta,
	regexpColor: ANSI.fg.cyan,
	errorColor: ANSI.fg.red,
	htmlTagColor: ANSI.fg.red,
	reactComponentColor: ANSI.fg.yellow,
	delimiterColor: ANSI.fg.cyan,
};

/**
 * Formats a value into a human-readable string representation.
 * 
 * This is inteded for debugging purposes.
 * @param value - The value to represent.
 * @param options - Optional formatting options.
 * @returns The formatted string.
 * @example
 * **Note:** The following examples omit the `options` parameter for simplicity. In reality, the return values will contain ANSI escape codes unless you explicitly set `colors` to `false`.
 * ```tsx
 * // Supports primitive values.
 * format(null) === "null"
 * format("example") === "\"example\""
 * 
 * // Supports objects and arrays (and other containers).
 * format({ size: 2, values: [true, false] }) === "{ size: 2, values: [true, false] }"
 * 
 * // Even supports React nodes.
 * format(<h1>Example</h1>) === "<h1>Example</h1>"
 * ```
 */
export function format(value: unknown, options?: FormatOptions): string {
	const context = resolveContext(options);

	if (value === null)
		return color("null", context.nullColor, context.colors);
	if (value === undefined)
		return color("undefined", context.undefinedColor, context.colors);
	if (typeof value === "boolean")
		return color(String(value), context.booleanColor, context.colors);
	if (typeof value === "number") {
		let string: string;
		if (Number.isNaN(value)) {
			string = "NaN";
		} else if (!Number.isFinite(value)) {
			string = value > 0 ? "Infinity" : "-Infinity";
		} else {
			string = String(value);
		}
		return color(string, context.numberColor, context.colors);
	}
	if (typeof value === "bigint")
		return color(value + "n", context.bigintColor, context.colors);
	if (typeof value === "string")
		return formatString(value, context);
	if (typeof value === "symbol")
		return color(value.toString(), context.symbolColor, context.colors);
	if (typeof value === "function")
		return formatFunction(value, context);
	if (isReactElement(value))
		return formatReactElement(value, context);
	if (Array.isArray(value))
		return formatArray(value, context);
	if (value instanceof Date)
		return color(value.toISOString(), context.dateColor, context.colors);
	if (value instanceof RegExp)
		return color(value.toString(), context.regexpColor, context.colors);
	if (value instanceof Error)
		return formatError(value, context);
	if (value instanceof Map)
		return formatMap(value, context);
	if (value instanceof Set)
		return formatSet(value, context);
	if (value instanceof Promise)
		return color("Promise { <pending> }", context.functionColor, context.colors);
	if (isObject(value))
		return formatObject(value, context);

	return Object.prototype.toString.call(value);
}

/**
 * Formats a function call with its arguments and return value into a string representation.
 * @param func - The function to represent.
 * @param args - The arguments of the function call.
 * @param returnValue - The return value of the function call.
 * @param options - Optional formatting options.
 * @returns The formatted string.
 */
export function formatFunctionCall<A extends unknown[] = [], R = undefined>(func: (...args: A) => R, args: A, returnValue: R, options?: FormatOptions): string {
	const context = resolveContext({ ...options, depth: 3 });
	const formattedName = color(func.name || "(anonymous)", context.functionColor, context.colors);
	const formattedArgs = args.map((arg) => format(arg, forkContext(context))).join(context.separator());
	const formattedReturnValue = format(returnValue, forkContext(context));
	const arrow = context.colors ? Ansi.dim("→") : "→";
	return `${formattedName}(${formattedArgs}) ${arrow} ${formattedReturnValue}`;
}

/**
 * Formats a React element into a string representation.
 * @param element - The React element to represent.
 * @param options - Optional formatting options.
 * @returns The formatted string.
 * @example
 * **Note:** The following example omits the `options` parameter for simplicity. In reality, the return values will contain ANSI escape codes unless you explicitly set `colors` to `false`.
 * ```tsx
 * format(<h1>Example</h1>) === "<h1>Example</h1>"
 * ```
 */
export function formatReactElement(element: ReactElementLike, options?: FormatOptions): string {
	const context = resolveContext(options);

	let name: string;
	let isFragment = false;
	if (typeof element.type === "string") {
		name = color(element.type, context.htmlTagColor, context.colors);
	} else if (element.type === REACT_FRAGMENT) {
		name = "";
		isFragment = true;
	} else {
		if (isObject(element.type) || typeof element.type === "function") {
			let componentName = element.type.name;
			if ("displayName" in element.type && element.type.displayName)
				componentName = element.type.displayName;
			name = String(componentName);
		} else {
			name = String(element.type);
		}
		name = color(name, context.reactComponentColor, context.colors);
	}

	const props: string[] = [];
	let children: string[] = [];

	if (element.props && isObject(element.props)) {
		const keys = Object.keys(element.props);
		if (context.sortKeys)
			keys.sort();

		for (const key of keys) {
			const value = element.props[key];
			if (key === "children") {
				const childArray = Array.isArray(value) ? value : [value];
				children = childArray.map((child) => formatReactElementChild(child, context));
			} else {
				props.push(formatReactElementProp(key, value, context));
			}
		}
	}

	const open = context.delimiter("<");
	const close = context.delimiter(">");
	const slash = context.delimiter("/");
	const formattedProps = props.length ? " " + props.join(" ") : "";
	
	return children.length || isFragment
		? `${open}${name}${formattedProps}${close}${children.join("")}${open}${slash}${name}${close}`
		: `${open}${name}${formattedProps}${slash}${close}`;
}

function formatReactElementChild(child: unknown, context: FormatContext) {
	if (child == null || typeof child === "boolean")
		return "";

	if (typeof child === "string")
		return child;

	if (typeof child === "number")
		return child.toString();

	return isReactElement(child) ? formatReactElement(child, forkContext(context)) : "";
}

function formatReactElementProp(key: string, value: unknown, context: FormatContext) {
	const coloredKey = color(key, context.keyColor, context.colors);
	return `${coloredKey}={${format(value, forkContext(context))}}`;
}

/**
 * Formats a string into a string representation.
 * @param string - The string to represent.
 * @param options - Optional formatting options.
 * @returns The formatted string.
 * @example
 * **Note:** The following examples omit or shorten the `options` parameter for simplicity. In reality, the return values will contain ANSI escape codes unless you explicitly set `colors` to `false`.
 * ```ts
 * format("Example") === "\"Example\""
 * format("Example", { singleQuotes: true }) === "'Example'"
 * ```
 */
export function formatString(string: string, options?: FormatOptions): string {
	const context = resolveContext(options);
	const needsTruncation = string.length > context.maxStringLength;
	const truncated = needsTruncation ? string.slice(0, context.maxStringLength) : string;

	let escaped = JSON.stringify(truncated);
	if (context.singleQuotes)
		escaped = escaped.replace(/'/g, "\\'");

	const inner = color(escaped.slice(1, -1), context.stringColor, context.colors);
	const quote = context.delimiter(context.singleQuotes ? "'" : "\"");
	const outer = quote + inner + quote;
	return needsTruncation ? outer + color("...", context.nullColor, context.colors) : outer;
}

/**
 * Formats a function into a string representation.
 * @param func - The function to represent.
 * @param options - Optional formatting options.
 * @returns The formatted string.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function formatFunction(func: Function, options?: FormatOptions): string {
	const context = resolveContext(options);
	const name = func.name || "(anonymous)";
	return color(`[Function: ${name}]`, context.functionColor, context.colors);
}

/**
 * Formats an array into a string representation.
 * @param array - The array to represent.
 * @param options - Optional formatting options.
 * @returns The formatted string.
 * @example
 * **Note:** The following examples omit or shorten the `options` parameter for simplicity. In reality, the return values will contain ANSI escape codes unless you explicitly set `colors` to `false`.
 * ```ts
 * format([1, 2, 3]) === "[1, 2, 3]"
 * format([1, 2, 3], { spaceAfterComma: false }) === "[1,2,3]"
 * ```
 */
export function formatArray(array: unknown[], options?: FormatOptions): string {
	const context = resolveContext(options);
	const guarded = guard(array, context, `[Array(${array.length})]`);
	if (guarded !== null)
		return guarded;

	const items: string[] = [];
	const length = Math.min(array.length, context.maxArrayLength);

	for (let i = 0; i < length; i++) {
		items.push(format(array[i], forkContext(context)));
	}

	if (array.length > context.maxArrayLength) {
		const remaining = array.length - context.maxArrayLength;
		items.push(color(`... ${remaining} more item${remaining !== 1 ? "s" : ""}`, context.nullColor, context.colors));
	}

	return formatInline(items, context, "[", "]");
}

/**
 * Formats an object into a string representation.
 * @param object - The object to represent.
 * @param options - Optional formatting options.
 * @returns The formatted string.
 * @example
 * **Note:** The following example omits the `options` parameter for simplicity. In reality, the return values will contain ANSI escape codes unless you explicitly set `colors` to `false`.
 * ```ts
 * format({ first: true, second: false }) === "{ first: true, second: false }"
 * ```
 */
export function formatObject(object: Record<PropertyKey, unknown>, options?: FormatOptions): string {
	const context = resolveContext(options);
	const guarded = guard(object, context, "[Object]");
	if (guarded !== null)
		return guarded;

	let keys = Object.keys(object);
	if (context.sortKeys)
		keys = keys.sort();

	if (keys.length === 0)
		return context.delimiter("{}");

	const entries = keys.map((key) => {
		const formattedKey = color(key, context.keyColor, context.colors);
		const formattedValue = format(object[key], forkContext(context));
		return `${formattedKey}${context.delimiter(":")} ${formattedValue}`;
	});

	const head = context.delimiter("{") + " ";
	const tail = " " + context.delimiter("}");
	return formatInline(entries, context, head, tail);
}

/**
 * Formats a Map into a string representation.
 * @param map - The map to represent.
 * @param options - Optional formatting options.
 * @returns The formatted string.
 */
export function formatMap(map: Map<unknown, unknown>, options?: FormatOptions): string {
	const context = resolveContext(options);
	const guarded = guard(map, context, `Map(${map.size})`);
	if (guarded !== null)
		return guarded;

	if (map.size === 0)
		return "Map(0) {}";

	const entries: string[] = [];
	const childOpts = forkContext(context);
	for (const [key, value] of map) {
		entries.push(`${format(key, childOpts)} => ${format(value, childOpts)}`);
	}

	return formatInline(entries, context, `Map(${map.size}) { `, " }");
}

/**
 * Formats a Set into a string representation.
 * @param set - The set to represent.
 * @param options - Optional formatting options.
 * @returns The formatted string.
 */
export function formatSet(set: Set<unknown>, options?: FormatOptions): string {
	const context = resolveContext(options);
	const guarded = guard(set, context, `Set(${set.size})`);
	if (guarded !== null)
		return guarded;

	if (set.size === 0)
		return "Set(0) {}";

	const items: string[] = [];
	for (const item of set) {
		items.push(format(item, forkContext(context)));
	}

	return formatInline(items, context, `Set(${set.size}) { `, " }");
}

/**
 * Formats an Error into a string representation.
 * @param error - The error to represent.
 * @param options - Optional formatting options.
 * @returns The formatted string.
 */
export function formatError(error: Error, options?: FormatOptions): string {
	const context = resolveContext(options);
	const name = error.name || "Error";
	const message = error.message || "";
	return color(`${name}: ${message}`, context.errorColor, context.colors);
}


function guard(object: object, context: FormatContext, label: string): string | null {
	if (context.seen.has(object))
		return color("[Circular]", context.nullColor, context.colors);
	if (context.currentDepth > context.depth)
		return color(label, context.nullColor, context.colors);
	context.seen.add(object);
	return null;
}

function formatInline(items: string[], context: FormatContext, head: string, tail: string): string {
	const inline = `${head}${items.join(context.separator())}${tail}`;
	if (!context.compact && Ansi.strip(inline).length > context.breakLength) {
		const indent = "\t".repeat(context.currentDepth + 1);
		const closingIndent = "\t".repeat(context.currentDepth);
		return `${head.replace(/ +$/, "")}\n${items.map((item) => `${indent}${item}`).join(",\n")}\n${closingIndent}${tail.replace(/^ +/, "")}`;
	}
	return inline;
}

function resolveContext(options?: FormatOptions): FormatContext {
	if (options && isContext(options))
		return options;

	const context: FormatContext = {
		...DEFAULT_OPTIONS,
		[CONTEXT]: true,
		currentDepth: 0,
		seen: new WeakSet(),
		delimiter: (delimiter) => color(delimiter, context.delimiterColor, context.colors),
		separator: () => context.spaceAfterComma ? context.delimiter(",") + " " : context.delimiter(","),
	};

	return options ? Object.assign(context, options) : context;
}

function forkContext(context: FormatContext): FormatContext {
	return { ...context, currentDepth: context.currentDepth + 1 };
}

function isContext(options: FormatOptions): options is FormatContext {
	return CONTEXT in options;
}

function color(text: string, colorCode: string | undefined | null, enabled: boolean) {
	return enabled && colorCode ? Ansi.apply(text, colorCode) : text;
}

function isReactElement(value: unknown): value is ReactElementLike {
	return isObject(value) && "$$typeof" in value && value.$$typeof === REACT_ELEMENT;
}