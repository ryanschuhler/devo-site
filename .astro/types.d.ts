declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"en": {
"00_INTRODUCTION.md": {
	id: "00_INTRODUCTION.md";
  slug: "00_introduction";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"01_DEVOTIONAL_John_21.md": {
	id: "01_DEVOTIONAL_John_21.md";
  slug: "01_devotional_john_21";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"02_DEVOTIONAL_Ezra_7.md": {
	id: "02_DEVOTIONAL_Ezra_7.md";
  slug: "02_devotional_ezra_7";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"03_DEVOTIONAL_Mark_6.md": {
	id: "03_DEVOTIONAL_Mark_6.md";
  slug: "03_devotional_mark_6";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"04_DEVOTIONAL_Acts_2.md": {
	id: "04_DEVOTIONAL_Acts_2.md";
  slug: "04_devotional_acts_2";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"05_DEVOTIONAL_Deuteronomy_6.md": {
	id: "05_DEVOTIONAL_Deuteronomy_6.md";
  slug: "05_devotional_deuteronomy_6";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"06_DEVOTIONAL_1_Corinthians_2a.md": {
	id: "06_DEVOTIONAL_1_Corinthians_2a.md";
  slug: "06_devotional_1_corinthians_2a";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"07_DEVOTIONAL_Ephesians_3.md": {
	id: "07_DEVOTIONAL_Ephesians_3.md";
  slug: "07_devotional_ephesians_3";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"08_DEVOTIONAL_1_Timothy_1.md": {
	id: "08_DEVOTIONAL_1_Timothy_1.md";
  slug: "08_devotional_1_timothy_1";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"09_DEVOTIONAL_Psalm_25.md": {
	id: "09_DEVOTIONAL_Psalm_25.md";
  slug: "09_devotional_psalm_25";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"10_DEVOTIONAL_Philippians_1.md": {
	id: "10_DEVOTIONAL_Philippians_1.md";
  slug: "10_devotional_philippians_1";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"11_DEVOTIONAL_John_15.md": {
	id: "11_DEVOTIONAL_John_15.md";
  slug: "11_devotional_john_15";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"12_DEVOTIONAL_Matthew_7.md": {
	id: "12_DEVOTIONAL_Matthew_7.md";
  slug: "12_devotional_matthew_7";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"13_DEVOTIONAL_Hebrews_4.md": {
	id: "13_DEVOTIONAL_Hebrews_4.md";
  slug: "13_devotional_hebrews_4";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"14_DEVOTIONAL_Joshua_1.md": {
	id: "14_DEVOTIONAL_Joshua_1.md";
  slug: "14_devotional_joshua_1";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"15_DEVOTIONAL_Luke_8.md": {
	id: "15_DEVOTIONAL_Luke_8.md";
  slug: "15_devotional_luke_8";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"16_DEVOTIONAL_Romans_12.md": {
	id: "16_DEVOTIONAL_Romans_12.md";
  slug: "16_devotional_romans_12";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"17_DEVOTIONAL_Ephesians_4a.md": {
	id: "17_DEVOTIONAL_Ephesians_4a.md";
  slug: "17_devotional_ephesians_4a";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"18_DEVOTIONAL_Ephesians_4b.md": {
	id: "18_DEVOTIONAL_Ephesians_4b.md";
  slug: "18_devotional_ephesians_4b";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"19_DEVOTIONAL_James_1.md": {
	id: "19_DEVOTIONAL_James_1.md";
  slug: "19_devotional_james_1";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"20_DEVOTIONAL_Psalm_71.md": {
	id: "20_DEVOTIONAL_Psalm_71.md";
  slug: "20_devotional_psalm_71";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"21_DEVOTIONAL_Matthew_10.md": {
	id: "21_DEVOTIONAL_Matthew_10.md";
  slug: "21_devotional_matthew_10";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"22_DEVOTIONAL_1_Timothy_4.md": {
	id: "22_DEVOTIONAL_1_Timothy_4.md";
  slug: "22_devotional_1_timothy_4";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"23_DEVOTIONAL_Colossians_1.md": {
	id: "23_DEVOTIONAL_Colossians_1.md";
  slug: "23_devotional_colossians_1";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"24_DEVOTIONAL_Psalm_119.md": {
	id: "24_DEVOTIONAL_Psalm_119.md";
  slug: "24_devotional_psalm_119";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"25_DEVOTIONAL_1_Corinthians_8.md": {
	id: "25_DEVOTIONAL_1_Corinthians_8.md";
  slug: "25_devotional_1_corinthians_8";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"26_DEVOTIONAL_2_Timothy_1.md": {
	id: "26_DEVOTIONAL_2_Timothy_1.md";
  slug: "26_devotional_2_timothy_1";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"27_DEVOTIONAL_Matthew_28.md": {
	id: "27_DEVOTIONAL_Matthew_28.md";
  slug: "27_devotional_matthew_28";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"28_DEVOTIONAL_Nehemiah_8.md": {
	id: "28_DEVOTIONAL_Nehemiah_8.md";
  slug: "28_devotional_nehemiah_8";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"29_DEVOTIONAL_Romans_15.md": {
	id: "29_DEVOTIONAL_Romans_15.md";
  slug: "29_devotional_romans_15";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"30_DEVOTIONAL_1_Corinthians_11+.md": {
	id: "30_DEVOTIONAL_1_Corinthians_11+.md";
  slug: "30_devotional_1_corinthians_11";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"31_DEVOTIONAL_Colossians_3.md": {
	id: "31_DEVOTIONAL_Colossians_3.md";
  slug: "31_devotional_colossians_3";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"32_DEVOTIONAL_2_Timothy_4.md": {
	id: "32_DEVOTIONAL_2_Timothy_4.md";
  slug: "32_devotional_2_timothy_4";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"33_DEVOTIONAL_Psalm_40.md": {
	id: "33_DEVOTIONAL_Psalm_40.md";
  slug: "33_devotional_psalm_40";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"34_DEVOTIONAL_John_13.md": {
	id: "34_DEVOTIONAL_John_13.md";
  slug: "34_devotional_john_13";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"35_DEVOTIONAL_Acts_17.md": {
	id: "35_DEVOTIONAL_Acts_17.md";
  slug: "35_devotional_acts_17";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"36_DEVOTIONAL_Titus_2.md": {
	id: "36_DEVOTIONAL_Titus_2.md";
  slug: "36_devotional_titus_2";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"37_DEVOTIONAL_2_Timothy_2a.md": {
	id: "37_DEVOTIONAL_2_Timothy_2a.md";
  slug: "37_devotional_2_timothy_2a";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"38_DEVOTIONAL_Psalm_145.md": {
	id: "38_DEVOTIONAL_Psalm_145.md";
  slug: "38_devotional_psalm_145";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"39_DEVOTIONAL_1_Corinthians_9.md": {
	id: "39_DEVOTIONAL_1_Corinthians_9.md";
  slug: "39_devotional_1_corinthians_9";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"40_DEVOTIONAL_Proverbs_4.md": {
	id: "40_DEVOTIONAL_Proverbs_4.md";
  slug: "40_devotional_proverbs_4";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"41_DEVOTIONAL_Romans_2.md": {
	id: "41_DEVOTIONAL_Romans_2.md";
  slug: "41_devotional_romans_2";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"42_DEVOTIONAL_1_Corinthians_3.md": {
	id: "42_DEVOTIONAL_1_Corinthians_3.md";
  slug: "42_devotional_1_corinthians_3";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"43_DEVOTIONAL_2_Timothy_2b.md": {
	id: "43_DEVOTIONAL_2_Timothy_2b.md";
  slug: "43_devotional_2_timothy_2b";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"44_DEVOTIONAL_1_Corinthians_13.md": {
	id: "44_DEVOTIONAL_1_Corinthians_13.md";
  slug: "44_devotional_1_corinthians_13";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"45_DEVOTIONAL_Philippians_4.md": {
	id: "45_DEVOTIONAL_Philippians_4.md";
  slug: "45_devotional_philippians_4";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"46_DEVOTIONAL_Matthew_23.md": {
	id: "46_DEVOTIONAL_Matthew_23.md";
  slug: "46_devotional_matthew_23";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"47_DEVOTIONAL_1_Corinthians_2b.md": {
	id: "47_DEVOTIONAL_1_Corinthians_2b.md";
  slug: "47_devotional_1_corinthians_2b";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"48_DEVOTIONAL_John_16.md": {
	id: "48_DEVOTIONAL_John_16.md";
  slug: "48_devotional_john_16";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"49_DEVOTIONAL_2_Timothy_3.md": {
	id: "49_DEVOTIONAL_2_Timothy_3.md";
  slug: "49_devotional_2_timothy_3";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"50_DEVOTIONAL_1_Thessalonians_2.md": {
	id: "50_DEVOTIONAL_1_Thessalonians_2.md";
  slug: "50_devotional_1_thessalonians_2";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"51_DEVOTIONAL_Psalm_78.md": {
	id: "51_DEVOTIONAL_Psalm_78.md";
  slug: "51_devotional_psalm_78";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
"52_DEVOTIONAL_Jeremiah_31.md": {
	id: "52_DEVOTIONAL_Jeremiah_31.md";
  slug: "52_devotional_jeremiah_31";
  body: string;
  collection: "en";
  data: any
} & { render(): Render[".md"] };
};
"es": {
"00_INTRODUCTION.md": {
	id: "00_INTRODUCTION.md";
  slug: "00_introduction";
  body: string;
  collection: "es";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
