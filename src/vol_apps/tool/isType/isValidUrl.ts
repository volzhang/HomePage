import * as v from "valibot";

const ValidUrlSchema = v.pipe(
	v.string(),
	v.url()
);

export const isValidUrl = (domain: string): boolean => v.is(ValidUrlSchema, domain);
