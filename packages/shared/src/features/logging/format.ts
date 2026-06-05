import { ANSI } from "../../constants";
import { Ansi } from "./ansi";
import { isObject, mergeDeep } from "../_utils";

const CONTEXT = Symbol("formatContext");
const REACT_ELEMENT = Symbol.for("react.element");
const REACT_FRAGMENT = Symbol.for("react.fragment");

/**
 * A plugin for formatting functions.
 * @see {@link format}
 */
export interface FormatPlugin {
	/** The name of this plugin. */
	name: string,
	/**
	 * A hook that configures the formatting options, before any formatting functions.
	 * @param options - The current formatting options.
	 */
	config?: (options: ResolvedFormatOptions) => void;
	/**
	 * A hook that runs before any formatting function.
	 * @param input - The input value.
	 * @param context - The formatting context.
	 */
	first?: (input: unknown, context: ResolvedFormatOptions) => string | undefined;
	/**
	 * A hook that runs if a value could not be formatted.
	 * @param input - The input value.
	 * @param context - The formatting context.
	 */
	fallback?: (input: unknown, context: ResolvedFormatOptions) => string | undefined;
	// transform?: (input: string, context: FormatPluginContext & { value: unknown }) => string | undefined;
}

/**
 * Configuration options for formatting functions.
 * @see {@link format}
 */
export interface FormatOptions {
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
	/**
	 * Plugins to extend, override or configure the formatting functions.
	 */
	plugins?: FormatPlugin[];
	/**
	 * The {@link ANSI} color codes for different symbols.
	 * 
	 * Set to `false` to disable ANSI colors.
	 */
	colors?: false | {
		/**
		 * The color to apply to strings.
		 * @default ANSI.fg.green
		 */
		string?: string | null;
		/**
		 * The color to apply to numbers.
		 * @default ANSI.fg.yellow
		 */
		number?: string | null;
		/**
		 * The color to apply to booleans.
		 * @default ANSI.fg.yellow
		 */
		boolean?: string | null;
		/**
		 * The color to apply to `null` keywords.
		 * @default ANSI.decoration.dim + ANSI.fg.yellow
		 */
		null?: string | null;
		/**
		 * The color to apply to `undefined` keywords.
		 * @default ANSI.decoration.dim + ANSI.fg.yellow
		 */
		undefined?: string | null;
		/**
		 * The color to apply to bigints.
		 * @default ANSI.fg.yellow
		 */
		bigint?: string | null;
		/**
		 * The color to apply to symbols.
		 * @default ANSI.fg.green
		 */
		symbol?: string | null;
		/**
		 * The color to apply to functions.
		 * @default ANSI.fg.blue
		 */
		function?: string | null;
		/**
		 * The color to apply to keys.
		 * @default ANSI.fg.white
		 */
		key?: string | null;
		/**
		 * The color to apply to dates.
		 * @default ANSI.fg.magenta
		 */
		date?: string | null;
		/**
		 * The color to apply to {@link RegExp}s.
		 * @default ANSI.fg.cyan
		 */
		regExp?: string | null;
		/**
		 * The color to apply to errors.
		 * @default ANSI.fg.red
		 */
		error?: string | null;
		/**
		 * The color to apply to HTML tags.
		 * @default ANSI.fg.red
		 */
		htmlTag?: string | null;
		/**
		 * The color to apply to React components.
		 * @default ANSI.fg.yellow
		 */
		reactComponent?: string | null;
		/**
		 * The color to apply to delimiters.
		 * @default ANSI.fg.cyan
		 */
		delimiter?: string | null;
	};
}

/**
 * The resolved formatting options combined with some utility functions for generating formatted strings.
 * 
 * Used internally by formatting functions and {@link FormatPlugin}s.
 * @see {@link format}
 */
export interface ResolvedFormatOptions extends Required<FormatOptions> {
	/**
	 * Returns a formatted delimiter string.
	 * @param delimiter - The raw delimiter.
	 */
	delimiter: (delimiter: string) => string;
	/** Returns a formatted separator string. */
	separator: () => string;
	/**
	 * Applies color to the given string, if {@link ResolvedFormatOptions.colors} is `true`.
	 * @param text - The raw text.
	 * @param colorCode - The ANSI color code to apply.
	 */
	color: (text: string, colorCode: string | undefined | null) => string;
	/**
	 * Applies the appropriate formatting to the given token.
	 * @param token - The raw token.
	 * @param type - The type of token.
	 */
	token: (token: string, type?: keyof Exclude<FormatOptions["colors"], false | undefined>) => string;
	fork: () => ResolvedFormatOptions;
}

interface FormatContext extends ResolvedFormatOptions {
	[CONTEXT]: true;
	currentDepth: number;
	seen: WeakSet<object>;
	fork: () => FormatContext;
}

export interface ReactElementLike {
	type: unknown;
	props?: unknown;
	key?: string | null;
}

const DEFAULT_OPTIONS: Required<FormatOptions> = {
	depth: 2,
	maxArrayLength: 100,
	maxStringLength: 80,
	breakLength: 60,
	compact: true,
	sortKeys: false,
	singleQuotes: false,
	spaceAfterComma: true,
	plugins: [],
	colors: {
		string: ANSI.fg.green,
		number: ANSI.fg.yellow,
		boolean: ANSI.fg.yellow,
		null: ANSI.decoration.dim + ANSI.fg.yellow,
		undefined: ANSI.decoration.dim + ANSI.fg.yellow,
		bigint: ANSI.fg.yellow,
		symbol: ANSI.fg.green,
		function: ANSI.fg.blue,
		key: ANSI.fg.white,
		date: ANSI.fg.magenta,
		regExp: ANSI.fg.cyan,
		error: ANSI.fg.red,
		htmlTag: ANSI.fg.red,
		reactComponent: ANSI.fg.yellow,
		delimiter: ANSI.fg.cyan,
	},
};

/**
 * Formats a value into a human-readable string representation.
 * 
 * This is intended for debugging purposes.
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
	const context = resolveContext(value, options);
	if (typeof context === "string")
		return context;

	if (value === null)
		return context.token("null", "null");
	if (value === undefined)
		return context.token("undefined", "undefined");
	if (typeof value === "boolean")
		return context.token(String(value), "boolean");
	if (typeof value === "number") {
		let string: string;
		if (Number.isNaN(value)) {
			string = "NaN";
		} else if (!Number.isFinite(value)) {
			string = value > 0 ? "Infinity" : "-Infinity";
		} else {
			string = String(value);
		}
		return context.token(string, "number");
	}
	if (typeof value === "bigint")
		return context.token(value + "n", "bigint");
	if (typeof value === "string")
		return formatString(value, context);
	if (typeof value === "symbol")
		return context.token(value.toString(), "symbol");
	if (typeof value === "function")
		return formatFunction(value, context);
	if (isReactElement(value))
		return formatReactElement(value, context);
	if (Array.isArray(value))
		return formatArray(value, context);
	if (value instanceof Date)
		return context.token(value.toISOString(), "date");
	if (value instanceof RegExp)
		return context.token(value.toString(), "regExp");
	if (value instanceof Error)
		return formatError(value, context);
	if (value instanceof Map)
		return formatMap(value, context);
	if (value instanceof Set)
		return formatSet(value, context);
	if (value instanceof Promise)
		return context.token("Promise { <pending> }", "function");
	if (isObject(value))
		return formatObject(value, context);

	for (const plugin of context.plugins) {
		if (plugin.fallback) {
			const result = plugin.fallback(value, context);
			if (result !== undefined)
				return result;
		}
	}

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
	const context = resolveContext(func, options);
	if (typeof context === "string")
		return context;

	const formattedName = context.token(func.name || "(anonymous)", "function");
	const formattedArgs = args.map((arg) => format(arg, context.fork())).join(context.separator());
	const formattedReturnValue = format(returnValue, context.fork());
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
	const context = resolveContext(element, options);
	if (typeof context === "string")
		return context;

	let name: string;
	let isFragment = false;
	if (typeof element.type === "string") {
		name = context.token(element.type, "htmlTag");
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
		name = context.token(name, "reactComponent");
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

	return isReactElement(child) ? formatReactElement(child, context.fork()) : "";
}

function formatReactElementProp(key: string, value: unknown, context: FormatContext) {
	const coloredKey = context.token(key, "key");
	return `${coloredKey}={${format(value, context.fork())}}`;
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
	const context = resolveContext(string, options);
	if (typeof context === "string")
		return context;

	const needsTruncation = string.length > context.maxStringLength;
	const truncated = needsTruncation ? string.slice(0, context.maxStringLength) : string;

	let escaped = JSON.stringify(truncated);
	if (context.singleQuotes)
		escaped = escaped.replace(/\\"/g, "\"").replace(/'/g, "\\'");

	const inner = context.token(escaped.slice(1, -1), "string");
	const quote = context.delimiter(context.singleQuotes ? "'" : "\"");
	const outer = quote + inner + quote;
	return needsTruncation ? outer + context.token("...", "null") : outer;
}

/**
 * Formats a function into a string representation.
 * @param func - The function to represent.
 * @param options - Optional formatting options.
 * @returns The formatted string.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function formatFunction(func: Function, options?: FormatOptions): string {
	const context = resolveContext(func, options);
	if (typeof context === "string")
		return context;

	const name = func.name || "(anonymous)";
	return context.token(`[Function: ${name}]`, "function");
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
	const context = resolveContext(array, options);
	if (typeof context === "string")
		return context;

	const guarded = guard(array, context, `[Array(${array.length})]`);
	if (guarded !== null)
		return guarded;

	const items: string[] = [];
	const length = Math.min(array.length, context.maxArrayLength);

	for (let i = 0; i < length; i++) {
		items.push(format(array[i], context.fork()));
	}

	if (array.length > context.maxArrayLength) {
		const remaining = array.length - context.maxArrayLength;
		items.push(context.token(`... ${remaining} more item${remaining !== 1 ? "s" : ""}`, "null"));
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
	const context = resolveContext(object, options);
	if (typeof context === "string")
		return context;

	const guarded = guard(object, context, "[Object]");
	if (guarded !== null)
		return guarded;

	let keys = Object.keys(object);
	if (context.sortKeys)
		keys = keys.sort();

	if (keys.length === 0)
		return context.delimiter("{}");

	const entries = keys.map((key) => {
		const formattedKey = context.token(key, "key");
		const formattedValue = format(object[key], context.fork());
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
	const context = resolveContext(map, options);
	if (typeof context === "string")
		return context;

	const guarded = guard(map, context, `Map(${map.size})`);
	if (guarded !== null)
		return guarded;

	if (map.size === 0)
		return "Map(0) {}";

	const entries: string[] = [];
	for (const [key, value] of map) {
		const fork = context.fork();
		entries.push(`${format(key, fork)} => ${format(value, fork)}`);
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
	const context = resolveContext(set, options);
	if (typeof context === "string")
		return context;

	const guarded = guard(set, context, `Set(${set.size})`);
	if (guarded !== null)
		return guarded;

	if (set.size === 0)
		return "Set(0) {}";

	const items: string[] = [];
	for (const item of set) {
		items.push(format(item, context.fork()));
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
	const context = resolveContext(error, options);
	if (typeof context === "string")
		return context;

	const name = error.name || "Error";
	return context.token(error.message ? `${name}: ${error.message}` : name, "error");
}


function guard(object: object, context: FormatContext, label: string): string | null {
	if (context.seen.has(object))
		return context.token("[Circular]", "null");
	if (context.currentDepth > context.depth)
		return context.token(label, "null");
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

function resolveContext(value: unknown, options?: FormatOptions): string | FormatContext {
	let context: FormatContext;
	if (options && isContext(options)) {
		context = options;
	} else {
		context = {
			// TODO: Fix mergeDeep so plugins and colors don't have to be duplicated here
			...options ? mergeDeep(DEFAULT_OPTIONS, { plugins: DEFAULT_OPTIONS.plugins, colors: DEFAULT_OPTIONS.colors, ...options }) : DEFAULT_OPTIONS,
			[CONTEXT]: true,
			currentDepth: 0,
			seen: new WeakSet(),
			color: (text, colorCode) =>  context.colors && colorCode ? Ansi.apply(text, colorCode) : text,
			token: (token, type) => type !== undefined && context.colors
				? context.color(token, context.colors[type])
				: token,
			delimiter: (delimiter) => context.token(delimiter, "delimiter"),
			separator: () => context.spaceAfterComma ? context.delimiter(",") + " " : context.delimiter(","),
			fork: () => forkContext(context),
		};

		for (const plugin of context.plugins) {
			if (plugin.config)
				plugin.config( context);
		}
	}
	
	// TODO: Add every value to the seen map and only run plugins once for every value	
	for (const plugin of context.plugins) {
		if (plugin.first) {
			const result = plugin.first(value, context);
			if (result !== undefined)
				return result;
		}
	}

	return context;
}

function forkContext(context: FormatContext): FormatContext {
	const newContext = { ...context, currentDepth: context.currentDepth + 1 };
	newContext.fork = () => forkContext(newContext);
	return newContext;
}

function isContext(options: FormatOptions): options is FormatContext {
	return CONTEXT in options;
}

function isReactElement(value: unknown): value is ReactElementLike {
	return isObject(value) && "$$typeof" in value && value.$$typeof === REACT_ELEMENT;
}