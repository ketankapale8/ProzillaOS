/**
 * Determines whether {@link arg} is an object.
 */
export function isObject(arg: unknown): arg is Record<PropertyKey, unknown> {
	return arg != null && typeof arg === "object" && !Array.isArray(arg);
}

/**
 * Merges the type of the target with one or more types of sources.
 * @typeParam Target - The target type to merge with.
 * @typeParam Sources - The source types to merge into the target type.
 */
export type Merge<Target, Sources extends unknown[]> = Sources extends []
	? Target
	: Sources extends [infer FirstSource, ...infer OtherSources]
		? Merge<MergeValues<Target, FirstSource>, OtherSources>
		: Sources extends (infer Source)[]
			? Target | MergeValues<Target, Source>
			: never;

/**
 * Merges the types of two primitive values.
 */
export type MergePrimitive<Target, Source> = undefined extends Source
	? Exclude<Source, undefined> extends never
		? Target
		: Exclude<Source, undefined>
	: Source;

/**
 * Merges the types of two values recursively.
 * 
 * Delegates to {@link MergePrimitive}, {@link MergeObjects} or {@link MergeArrays} if the two values are primitives, objects or arrays respectively.
 */
export type MergeValues<Target, Source> = Target extends Record<PropertyKey, unknown>
	? Source extends Record<PropertyKey, unknown>
		? [Target, Source] extends [Source, Target]
			? Target
			: MergeObjects<Target, Source>
		: Source
	: Target extends unknown[]
		? Source extends unknown[]
			? MergeArrays<Target, Source>
			: Source
		: MergePrimitive<Target, Source>;

/**
 * Merges the types of two objects recursively.
 * 
 * Properties are merged using {@link MergeValues}.
 */
export type MergeObjects<Target extends Record<PropertyKey, unknown>, Source extends Record<PropertyKey, unknown>> = {
	[Key in keyof Target | keyof Source]: Key extends keyof Source
		? Key extends keyof Target
			? MergeValues<Target[Key], Source[Key]>
			: Source[Key]
		: Target[Key & keyof Target]
};

/**
 * Merges the types of two arrays by concatenating them.
 */
export type MergeArrays<Target extends unknown[], Source extends unknown[]> = [...Target, ...Source];

/**
 * Recursively merges two or more objects.
 * 
 * If a property is defined in two objects and the values are both objects, they are merged recursively, 
 * if they are both arrays, they are concatenated, otherwise the value of the second object overrides the value of the first.
 * @param target - The target object to merge the other objects with.
 * @param sources - The objects to merge with the target object.
 * @returns The merged object.
 */
export function mergeDeep<Target extends Record<PropertyKey, unknown>, Sources extends Record<PropertyKey, unknown>[] = Target[]>(target: Target, ...sources: Sources): Merge<Target, Sources> {
	const result: Record<PropertyKey, unknown> = { ...target };
	
	for (const source of sources) {
		for (const key in source) {
			if (isObject(result[key]) && isObject(source[key])) {
				result[key] = mergeDeep(result[key], source[key]);
			} else if (Array.isArray(result[key]) && Array.isArray(source[key])) {
				result[key] = result[key].concat(source[key]);
			} else if (source[key] !== undefined) {
				result[key] = source[key];
			}
		}
	}

	return result as Merge<Target, Sources>;
}