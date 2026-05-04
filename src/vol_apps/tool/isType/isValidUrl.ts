import * as v from "valibot";

const ValidUrlSchema = v.pipe(
	v.string(),
	v.url()
);

const ComponentUrlSchema = v.pipe(
	v.string(),
	v.startsWith("COMPONENT:"),
	// v.minLength(10)
)

export const isValidUrl = (domain: string): boolean => v.is(ValidUrlSchema, domain);

export const isComponentUrl = (domain: string): boolean => v.is(ComponentUrlSchema, domain);
