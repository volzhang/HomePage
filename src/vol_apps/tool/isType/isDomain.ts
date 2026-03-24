import * as v from "valibot";

const DomainSchema = v.pipe(
	v.string(),
	v.url()
);

export const isDomain = (domain: string): boolean => v.is(DomainSchema, domain);
