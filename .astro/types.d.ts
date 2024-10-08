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
		"devocionais": {
"a-alegria-do-senhor-é-a-sua-força.md": {
	id: "a-alegria-do-senhor-é-a-sua-força.md";
  slug: "a-alegria-do-senhor-é-a-sua-força";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"a-marca-do-discipulado.md": {
	id: "a-marca-do-discipulado.md";
  slug: "a-marca-do-discipulado";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"amor-acima-de-tudo.md": {
	id: "amor-acima-de-tudo.md";
  slug: "amor-acima-de-tudo";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"aprendendo-e-crescendo-a-cada-dia.md": {
	id: "aprendendo-e-crescendo-a-cada-dia.md";
  slug: "aprendendo-e-crescendo-a-cada-dia";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"building-on-the-rock-instead-of-sand.md": {
	id: "building-on-the-rock-instead-of-sand.md";
  slug: "building-on-the-rock-instead-of-sand";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"como-ovelha-sem-pastor.md": {
	id: "como-ovelha-sem-pastor.md";
  slug: "como-ovelha-sem-pastor";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"concentrados-no-bem,-colocando-em-prática-aquilo-que aprendemos.md": {
	id: "concentrados-no-bem,-colocando-em-prática-aquilo-que aprendemos.md";
  slug: "concentrados-no-bem-colocando-em-prática-aquilo-que-aprendemos";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"confiança-no-trabalha-contínuo-de-deus.md": {
	id: "confiança-no-trabalha-contínuo-de-deus.md";
  slug: "confiança-no-trabalha-contínuo-de-deus";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"conhecer-o-amor-de-deus.md": {
	id: "conhecer-o-amor-de-deus.md";
  slug: "conhecer-o-amor-de-deus";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"conhecimento-orgulho-e-cuidado-com-os-outros.md": {
	id: "conhecimento-orgulho-e-cuidado-com-os-outros.md";
  slug: "conhecimento-orgulho-e-cuidado-com-os-outros";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"crescendo-através-da-imitação.md": {
	id: "crescendo-através-da-imitação.md";
  slug: "crescendo-através-da-imitação";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"crescendo-rumo-à-maturidade-em-cristo.md": {
	id: "crescendo-rumo-à-maturidade-em-cristo.md";
  slug: "crescendo-rumo-à-maturidade-em-cristo";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"cumpra-o-seu-ministério.md": {
	id: "cumpra-o-seu-ministério.md";
  slug: "cumpra-o-seu-ministério";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"deixando-a-palavra-de-cristo-habitar-ricamente-em-você.md": {
	id: "deixando-a-palavra-de-cristo-habitar-ricamente-em-você.md";
  slug: "deixando-a-palavra-de-cristo-habitar-ricamente-em-você";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"depositando-nossa-esperança-em-deus.md": {
	id: "depositando-nossa-esperança-em-deus.md";
  slug: "depositando-nossa-esperança-em-deus";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"deus-nosso-mestre.md": {
	id: "deus-nosso-mestre.md";
  slug: "deus-nosso-mestre";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"ensinando-a-nós-primeiro.md": {
	id: "ensinando-a-nós-primeiro.md";
  slug: "ensinando-a-nós-primeiro";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"ensinando-aqueles-que-podem-ensinar-outros.md": {
	id: "ensinando-aqueles-que-podem-ensinar-outros.md";
  slug: "ensinando-aqueles-que-podem-ensinar-outros";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"ensinando-com-paciência-e-mansidão.md": {
	id: "ensinando-com-paciência-e-mansidão.md";
  slug: "ensinando-com-paciência-e-mansidão";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"ensinando-como-uma-mãe-e-um-pai.md": {
	id: "ensinando-como-uma-mãe-e-um-pai.md";
  slug: "ensinando-como-uma-mãe-e-um-pai";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"estas-palavras-estarão-em-seu-coração.md": {
	id: "estas-palavras-estarão-em-seu-coração.md";
  slug: "estas-palavras-estarão-em-seu-coração";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"estude-faça-ensine.md": {
	id: "estude-faça-ensine.md";
  slug: "estude-faça-ensine";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"examinando-as-escrituras.md": {
	id: "examinando-as-escrituras.md";
  slug: "examinando-as-escrituras";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"guardando-a-sua-palavra-em-meu-coração.md": {
	id: "guardando-a-sua-palavra-em-meu-coração.md";
  slug: "guardando-a-sua-palavra-em-meu-coração";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"integridade-no-seu-ensino.md": {
	id: "integridade-no-seu-ensino.md";
  slug: "integridade-no-seu-ensino";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"nos-tornando-como-nosso-mestre-e-professor.md": {
	id: "nos-tornando-como-nosso-mestre-e-professor.md";
  slug: "nos-tornando-como-nosso-mestre-e-professor";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"nos-tornando-praticantes-da-palavra.md": {
	id: "nos-tornando-praticantes-da-palavra.md";
  slug: "nos-tornando-praticantes-da-palavra";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"nosso-único-mestre.md": {
	id: "nosso-único-mestre.md";
  slug: "nosso-único-mestre";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"o-alvo-de-nosso-ensino.md": {
	id: "o-alvo-de-nosso-ensino.md";
  slug: "o-alvo-de-nosso-ensino";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"o-evangelho-uma-mensagem-simples-e-poderosa.md": {
	id: "o-evangelho-uma-mensagem-simples-e-poderosa.md";
  slug: "o-evangelho-uma-mensagem-simples-e-poderosa";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"o-ministério-do-espírito-santo-em-nosso-ensino.md": {
	id: "o-ministério-do-espírito-santo-em-nosso-ensino.md";
  slug: "o-ministério-do-espírito-santo-em-nosso-ensino";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"o-poder-da-palavra-viva-de-deus.md": {
	id: "o-poder-da-palavra-viva-de-deus.md";
  slug: "o-poder-da-palavra-viva-de-deus";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"o-poder-das-escrituras.md": {
	id: "o-poder-das-escrituras.md";
  slug: "o-poder-das-escrituras";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"o-princípio-da-sabedoria.md": {
	id: "o-princípio-da-sabedoria.md";
  slug: "o-princípio-da-sabedoria";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"obreiros-de-deus.md": {
	id: "obreiros-de-deus.md";
  slug: "obreiros-de-deus";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"observando-a-nós-mesmo-e-ao-nosso-ensino.md": {
	id: "observando-a-nós-mesmo-e-ao-nosso-ensino.md";
  slug: "observando-a-nós-mesmo-e-ao-nosso-ensino";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"permanecendo-e-dando-muitos-frutos.md": {
	id: "permanecendo-e-dando-muitos-frutos.md";
  slug: "permanecendo-e-dando-muitos-frutos";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"perseverança-encorajamento-e-esperança.md": {
	id: "perseverança-encorajamento-e-esperança.md";
  slug: "perseverança-encorajamento-e-esperança";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"preparando-os-santos-edificando-o-corpo.md": {
	id: "preparando-os-santos-edificando-o-corpo.md";
  slug: "preparando-os-santos-edificando-o-corpo";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"proclamando-sua-grandeza-à-próxima-geração.md": {
	id: "proclamando-sua-grandeza-à-próxima-geração.md";
  slug: "proclamando-sua-grandeza-à-próxima-geração";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"registrada-em-nossos-corações.md": {
	id: "registrada-em-nossos-corações.md";
  slug: "registrada-em-nossos-corações";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"se-despir-ser-renovado-se-revestir.md": {
	id: "se-despir-ser-renovado-se-revestir.md";
  slug: "se-despir-ser-renovado-se-revestir";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"se-tornando-tudo-para-todos-a-fim-de-ganhar-alguns.md": {
	id: "se-tornando-tudo-para-todos-a-fim-de-ganhar-alguns.md";
  slug: "se-tornando-tudo-para-todos-a-fim-de-ganhar-alguns";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"seguindo-o-padrão-das-sãs-palavras.md": {
	id: "seguindo-o-padrão-das-sãs-palavras.md";
  slug: "seguindo-o-padrão-das-sãs-palavras";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"seja-forte-e-corajoso.md": {
	id: "seja-forte-e-corajoso.md";
  slug: "seja-forte-e-corajoso";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"sementes-e-solos.md": {
	id: "sementes-e-solos.md";
  slug: "sementes-e-solos";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"sendo-transformados-pela-renovação-de-nossas-mentes.md": {
	id: "sendo-transformados-pela-renovação-de-nossas-mentes.md";
  slug: "sendo-transformados-pela-renovação-de-nossas-mentes";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"sua-lei-está-em-meu-coração.md": {
	id: "sua-lei-está-em-meu-coração.md";
  slug: "sua-lei-está-em-meu-coração";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"tendo-a-mente-de-cristo.md": {
	id: "tendo-a-mente-de-cristo.md";
  slug: "tendo-a-mente-de-cristo";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"uma-geração-contará-tuas-obras-à-outra.md": {
	id: "uma-geração-contará-tuas-obras-à-outra.md";
  slug: "uma-geração-contará-tuas-obras-à-outra";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"você-me-ama-apascente-minhas-ovelhas.md": {
	id: "você-me-ama-apascente-minhas-ovelhas.md";
  slug: "você-me-ama-apascente-minhas-ovelhas";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
"vá-e-faça-discípulos.md": {
	id: "vá-e-faça-discípulos.md";
  slug: "vá-e-faça-discípulos";
  body: string;
  collection: "devocionais";
  data: any
} & { render(): Render[".md"] };
};
"devocionales": {
"amor-por-encima-de-todo.md": {
	id: "amor-por-encima-de-todo.md";
  slug: "amor-por-encima-de-todo";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"aprender-y-crecer-día-a-día.md": {
	id: "aprender-y-crecer-día-a-día.md";
  slug: "aprender-y-crecer-día-a-día";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"centrarse-en-lo-bueno-y-practicar-lo-aprendido.md": {
	id: "centrarse-en-lo-bueno-y-practicar-lo-aprendido.md";
  slug: "centrarse-en-lo-bueno-y-practicar-lo-aprendido";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"como-ovejas-sin-pastor.md": {
	id: "como-ovejas-sin-pastor.md";
  slug: "como-ovejas-sin-pastor";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"confianza-en-la-obra-de-dios.md": {
	id: "confianza-en-la-obra-de-dios.md";
  slug: "confianza-en-la-obra-de-dios";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"conocer-el-amor-de-dios.md": {
	id: "conocer-el-amor-de-dios.md";
  slug: "conocer-el-amor-de-dios";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"conocimiento-orgullo-y-preocupación-por-los-demás.md": {
	id: "conocimiento-orgullo-y-preocupación-por-los-demás.md";
  slug: "conocimiento-orgullo-y-preocupación-por-los-demás";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"construir-sobre-la-roca-en-vez-de-sobre-la-arena.md": {
	id: "construir-sobre-la-roca-en-vez-de-sobre-la-arena.md";
  slug: "construir-sobre-la-roca-en-vez-de-sobre-la-arena";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"convertirse-en-hacedores-de-la-palabra.md": {
	id: "convertirse-en-hacedores-de-la-palabra.md";
  slug: "convertirse-en-hacedores-de-la-palabra";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"crecer-a-través-de-la-imitación.md": {
	id: "crecer-a-través-de-la-imitación.md";
  slug: "crecer-a-través-de-la-imitación";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"crecer-en-la-madurez-en-cristo.md": {
	id: "crecer-en-la-madurez-en-cristo.md";
  slug: "crecer-en-la-madurez-en-cristo";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"cuidar-de-nosotros-mismos-y-de-nuestra-enseñanza.md": {
	id: "cuidar-de-nosotros-mismos-y-de-nuestra-enseñanza.md";
  slug: "cuidar-de-nosotros-mismos-y-de-nuestra-enseñanza";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"cumple-con-tu-ministerio.md": {
	id: "cumple-con-tu-ministerio.md";
  slug: "cumple-con-tu-ministerio";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"despojarse-renovarse-vestirse.md": {
	id: "despojarse-renovarse-vestirse.md";
  slug: "despojarse-renovarse-vestirse";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"dios-nuestro-maestro.md": {
	id: "dios-nuestro-maestro.md";
  slug: "dios-nuestro-maestro";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"el-evangelio-un-mensaje-sencillo-y-poderoso.md": {
	id: "el-evangelio-un-mensaje-sencillo-y-poderoso.md";
  slug: "el-evangelio-un-mensaje-sencillo-y-poderoso";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"el-gozo-de-jehová-es-vuestra-fuerza.md": {
	id: "el-gozo-de-jehová-es-vuestra-fuerza.md";
  slug: "el-gozo-de-jehová-es-vuestra-fuerza";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"el-ministerio-del-espíritu-santo-en-nuestra-enseñanza.md": {
	id: "el-ministerio-del-espíritu-santo-en-nuestra-enseñanza.md";
  slug: "el-ministerio-del-espíritu-santo-en-nuestra-enseñanza";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"el-objetivo-de-nuestra-enseñanza.md": {
	id: "el-objetivo-de-nuestra-enseñanza.md";
  slug: "el-objetivo-de-nuestra-enseñanza";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"el-poder-de-la-escritura.md": {
	id: "el-poder-de-la-escritura.md";
  slug: "el-poder-de-la-escritura";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"el-poder-de-la-palabra-viva-de-dios.md": {
	id: "el-poder-de-la-palabra-viva-de-dios.md";
  slug: "el-poder-de-la-palabra-viva-de-dios";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"el-principio-de-la-sabiduría.md": {
	id: "el-principio-de-la-sabiduría.md";
  slug: "el-principio-de-la-sabiduría";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"enseñar-a-quienes-pueden-enseñar-a-otros.md": {
	id: "enseñar-a-quienes-pueden-enseñar-a-otros.md";
  slug: "enseñar-a-quienes-pueden-enseñar-a-otros";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"enseñar-como-una-madre-y-un-padre.md": {
	id: "enseñar-como-una-madre-y-un-padre.md";
  slug: "enseñar-como-una-madre-y-un-padre";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"enseñar-con-paciencia-y-dulzura.md": {
	id: "enseñar-con-paciencia-y-dulzura.md";
  slug: "enseñar-con-paciencia-y-dulzura";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"enseñarnos-primero-a-nosotros-mismos.md": {
	id: "enseñarnos-primero-a-nosotros-mismos.md";
  slug: "enseñarnos-primero-a-nosotros-mismos";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"esfuérzate-y-sé-valiente.md": {
	id: "esfuérzate-y-sé-valiente.md";
  slug: "esfuérzate-y-sé-valiente";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"estas-palabras-estarán-sobre-tu-corazón.md": {
	id: "estas-palabras-estarán-sobre-tu-corazón.md";
  slug: "estas-palabras-estarán-sobre-tu-corazón";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"estúdiala-cúmplela-enséñala.md": {
	id: "estúdiala-cúmplela-enséñala.md";
  slug: "estúdiala-cúmplela-enséñala";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"examinar-las-escrituras.md": {
	id: "examinar-las-escrituras.md";
  slug: "examinar-las-escrituras";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"generación-a-generación-celebrará-tus-obras.md": {
	id: "generación-a-generación-celebrará-tus-obras.md";
  slug: "generación-a-generación-celebrará-tus-obras";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"guardando-tu-palabra-en-mi-corazón.md": {
	id: "guardando-tu-palabra-en-mi-corazón.md";
  slug: "guardando-tu-palabra-en-mi-corazón";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"id-y-haced-discípulos.md": {
	id: "id-y-haced-discípulos.md";
  slug: "id-y-haced-discípulos";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"la-ley-de-dios-escrita-en-nuestros-corazones.md": {
	id: "la-ley-de-dios-escrita-en-nuestros-corazones.md";
  slug: "la-ley-de-dios-escrita-en-nuestros-corazones";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"la-marca-del-discipulado.md": {
	id: "la-marca-del-discipulado.md";
  slug: "la-marca-del-discipulado";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"llegar-a-ser-como-nuestro-señor-y-maestro.md": {
	id: "llegar-a-ser-como-nuestro-señor-y-maestro.md";
  slug: "llegar-a-ser-como-nuestro-señor-y-maestro";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"los-colaboradoores-de-dios.md": {
	id: "los-colaboradoores-de-dios.md";
  slug: "los-colaboradoores-de-dios";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"me-amas-apacienta-mis-corderos.md": {
	id: "me-amas-apacienta-mis-corderos.md";
  slug: "me-amas-apacienta-mis-corderos";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"me-he-hecho-de-todo-para-que-de-todos-modos-salve-a-algunos.md": {
	id: "me-he-hecho-de-todo-para-que-de-todos-modos-salve-a-algunos.md";
  slug: "me-he-hecho-de-todo-para-que-de-todos-modos-salve-a-algunos";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"muestra-integridad-en-tu-enseñanza.md": {
	id: "muestra-integridad-en-tu-enseñanza.md";
  slug: "muestra-integridad-en-tu-enseñanza";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"nuestro-único-maestro.md": {
	id: "nuestro-único-maestro.md";
  slug: "nuestro-único-maestro";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"paciencia-consolación-y-esperanza.md": {
	id: "paciencia-consolación-y-esperanza.md";
  slug: "paciencia-consolación-y-esperanza";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"perfeccionar-a-los-santos-edificar-el-cuerpo.md": {
	id: "perfeccionar-a-los-santos-edificar-el-cuerpo.md";
  slug: "perfeccionar-a-los-santos-edificar-el-cuerpo";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"permanecer-y-dar-mucho-fruto.md": {
	id: "permanecer-y-dar-mucho-fruto.md";
  slug: "permanecer-y-dar-mucho-fruto";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"poner-nuestra-confianza-en-dios.md": {
	id: "poner-nuestra-confianza-en-dios.md";
  slug: "poner-nuestra-confianza-en-dios";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"proclamar-tu-poder-a-otra-generación.md": {
	id: "proclamar-tu-poder-a-otra-generación.md";
  slug: "proclamar-tu-poder-a-otra-generación";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"que-la-palabra-de-cristo-more-en-abundancia-en-ti.md": {
	id: "que-la-palabra-de-cristo-more-en-abundancia-en-ti.md";
  slug: "que-la-palabra-de-cristo-more-en-abundancia-en-ti";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"retén-la-forma-de-las-sanas-palabras.md": {
	id: "retén-la-forma-de-las-sanas-palabras.md";
  slug: "retén-la-forma-de-las-sanas-palabras";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"semillas-y-suelos.md": {
	id: "semillas-y-suelos.md";
  slug: "semillas-y-suelos";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"tener-la-mente-de-cristo.md": {
	id: "tener-la-mente-de-cristo.md";
  slug: "tener-la-mente-de-cristo";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"transformados-por-la-renovación-de-nuestras-mentes.md": {
	id: "transformados-por-la-renovación-de-nuestras-mentes.md";
  slug: "transformados-por-la-renovación-de-nuestras-mentes";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
"tu-ley-está-en-medio-de-mi-corazón.md": {
	id: "tu-ley-está-en-medio-de-mi-corazón.md";
  slug: "tu-ley-está-en-medio-de-mi-corazón";
  body: string;
  collection: "devocionales";
  data: any
} & { render(): Render[".md"] };
};
"devotionals": {
"abiding-and-bearing-much-fruit.md": {
	id: "abiding-and-bearing-much-fruit.md";
  slug: "abiding-and-bearing-much-fruit";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"be-strong-and-courageous.md": {
	id: "be-strong-and-courageous.md";
  slug: "be-strong-and-courageous";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"becoming-all-things-to-all-people-to-win-some.md": {
	id: "becoming-all-things-to-all-people-to-win-some.md";
  slug: "becoming-all-things-to-all-people-to-win-some";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"becoming-doers-of-the-word.md": {
	id: "becoming-doers-of-the-word.md";
  slug: "becoming-doers-of-the-word";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"becoming-like-our-master-and-teacher.md": {
	id: "becoming-like-our-master-and-teacher.md";
  slug: "becoming-like-our-master-and-teacher";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"being-transformed-by-the-renewal-of-our-minds.md": {
	id: "being-transformed-by-the-renewal-of-our-minds.md";
  slug: "being-transformed-by-the-renewal-of-our-minds";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"building-on-the-rock-instead-of-sand.md": {
	id: "building-on-the-rock-instead-of-sand.md";
  slug: "building-on-the-rock-instead-of-sand";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"confidence-in-gods-ongoing-work.md": {
	id: "confidence-in-gods-ongoing-work.md";
  slug: "confidence-in-gods-ongoing-work";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"do-you-love-me-feed-my-lambs.md": {
	id: "do-you-love-me-feed-my-lambs.md";
  slug: "do-you-love-me-feed-my-lambs";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"endurance-encouragement-and-hope.md": {
	id: "endurance-encouragement-and-hope.md";
  slug: "endurance-encouragement-and-hope";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"equipping-the-saints-building-up-the-body.md": {
	id: "equipping-the-saints-building-up-the-body.md";
  slug: "equipping-the-saints-building-up-the-body";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"examining-the-scriptures.md": {
	id: "examining-the-scriptures.md";
  slug: "examining-the-scriptures";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"focusing-on-the-good-practicing-what-we-learn.md": {
	id: "focusing-on-the-good-practicing-what-we-learn.md";
  slug: "focusing-on-the-good-practicing-what-we-learn";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"following-the-pattern-of-sound-words.md": {
	id: "following-the-pattern-of-sound-words.md";
  slug: "following-the-pattern-of-sound-words";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"fulfilling-your-ministry.md": {
	id: "fulfilling-your-ministry.md";
  slug: "fulfilling-your-ministry";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"go-and-make-disciples.md": {
	id: "go-and-make-disciples.md";
  slug: "go-and-make-disciples";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"god-our-teacher.md": {
	id: "god-our-teacher.md";
  slug: "god-our-teacher";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"gods-fellow-workers.md": {
	id: "gods-fellow-workers.md";
  slug: "gods-fellow-workers";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"growing-through-imitation.md": {
	id: "growing-through-imitation.md";
  slug: "growing-through-imitation";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"growing-toward-maturity-in-christ.md": {
	id: "growing-toward-maturity-in-christ.md";
  slug: "growing-toward-maturity-in-christ";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"having-the-mind-of-christ.md": {
	id: "having-the-mind-of-christ.md";
  slug: "having-the-mind-of-christ";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"integrity-in-your-teaching.md": {
	id: "integrity-in-your-teaching.md";
  slug: "integrity-in-your-teaching";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"knowledge-pride-and-care-for-others.md": {
	id: "knowledge-pride-and-care-for-others.md";
  slug: "knowledge-pride-and-care-for-others";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"learning-and-growing-day-by-day.md": {
	id: "learning-and-growing-day-by-day.md";
  slug: "learning-and-growing-day-by-day";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"letting-the-word-of-christ-dwell-in-you-richly.md": {
	id: "letting-the-word-of-christ-dwell-in-you-richly.md";
  slug: "letting-the-word-of-christ-dwell-in-you-richly";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"like-sheep-without-a-shepherd.md": {
	id: "like-sheep-without-a-shepherd.md";
  slug: "like-sheep-without-a-shepherd";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"love-above-all.md": {
	id: "love-above-all.md";
  slug: "love-above-all";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"of-seeds-and-soils.md": {
	id: "of-seeds-and-soils.md";
  slug: "of-seeds-and-soils";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"one-generation-shall-commend-your-works-to-another.md": {
	id: "one-generation-shall-commend-your-works-to-another.md";
  slug: "one-generation-shall-commend-your-works-to-another";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"our-one-teacher.md": {
	id: "our-one-teacher.md";
  slug: "our-one-teacher";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"proclaiming-your-might-to-another-generation.md": {
	id: "proclaiming-your-might-to-another-generation.md";
  slug: "proclaiming-your-might-to-another-generation";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"putting-off-being-renewed-putting-on.md": {
	id: "putting-off-being-renewed-putting-on.md";
  slug: "putting-off-being-renewed-putting-on";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"setting-our-hope-in-god.md": {
	id: "setting-our-hope-in-god.md";
  slug: "setting-our-hope-in-god";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"storing-up-your-word-in-my-heart.md": {
	id: "storing-up-your-word-in-my-heart.md";
  slug: "storing-up-your-word-in-my-heart";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"study-it-do-it-teach-it.md": {
	id: "study-it-do-it-teach-it.md";
  slug: "study-it-do-it-teach-it";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"teaching-like-a-mother-and-a-father.md": {
	id: "teaching-like-a-mother-and-a-father.md";
  slug: "teaching-like-a-mother-and-a-father";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"teaching-ourselves-first.md": {
	id: "teaching-ourselves-first.md";
  slug: "teaching-ourselves-first";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"teaching-those-who-can-teach-others.md": {
	id: "teaching-those-who-can-teach-others.md";
  slug: "teaching-those-who-can-teach-others";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"teaching-with-patience-and-gentleness.md": {
	id: "teaching-with-patience-and-gentleness.md";
  slug: "teaching-with-patience-and-gentleness";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"the-beginning-of-wisdom.md": {
	id: "the-beginning-of-wisdom.md";
  slug: "the-beginning-of-wisdom";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"the-goal-of-our-teaching.md": {
	id: "the-goal-of-our-teaching.md";
  slug: "the-goal-of-our-teaching";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"the-gospel-a-simple-powerful-message.md": {
	id: "the-gospel-a-simple-powerful-message.md";
  slug: "the-gospel-a-simple-powerful-message";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"the-joy-of-the-lord-is-your-strength.md": {
	id: "the-joy-of-the-lord-is-your-strength.md";
  slug: "the-joy-of-the-lord-is-your-strength";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"the-mark-of-discipleship.md": {
	id: "the-mark-of-discipleship.md";
  slug: "the-mark-of-discipleship";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"the-ministry-of-the-holy-spirit-in-our-teaching.md": {
	id: "the-ministry-of-the-holy-spirit-in-our-teaching.md";
  slug: "the-ministry-of-the-holy-spirit-in-our-teaching";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"the-power-of-the-living-word-of-god.md": {
	id: "the-power-of-the-living-word-of-god.md";
  slug: "the-power-of-the-living-word-of-god";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"the-power-of-the-scripture.md": {
	id: "the-power-of-the-scripture.md";
  slug: "the-power-of-the-scripture";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"these-words-shall-be-on-your-heart.md": {
	id: "these-words-shall-be-on-your-heart.md";
  slug: "these-words-shall-be-on-your-heart";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"to-know-the-love-of-god.md": {
	id: "to-know-the-love-of-god.md";
  slug: "to-know-the-love-of-god";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"watching-both-ourselves-and-our-teaching.md": {
	id: "watching-both-ourselves-and-our-teaching.md";
  slug: "watching-both-ourselves-and-our-teaching";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"written-on-our-hearts.md": {
	id: "written-on-our-hearts.md";
  slug: "written-on-our-hearts";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
"your-law-is-within-my-heart.md": {
	id: "your-law-is-within-my-heart.md";
  slug: "your-law-is-within-my-heart";
  body: string;
  collection: "devotionals";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = never;
}
