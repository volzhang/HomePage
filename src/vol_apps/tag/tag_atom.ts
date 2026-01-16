import {createAtom} from "@/vol_apps/atomStorage/atomStorage";
import {useAtom} from "jotai";

export type TagType = {
	name: string;
	checked: boolean;
}

const createTag = (
	name:string, checked:boolean) => {
	return {name: name, checked: checked,};}

export const test_tags: TagType[] = [
	createTag("tag1",true),
	createTag("tag2",false),
	createTag("tag3",true),
	createTag("tag4",false),
	createTag("标签5",true),
];

const atom_tag = await createAtom<TagType[]>("atom_tag", []);

export const useTagStore = () => {
	const [tags, setTags] = useAtom(atom_tag);
	const selectTags = tags.filter((tag: TagType) => tag.checked);


	const updateTag = (name: string, updates: Partial<TagType>) => {
		const newTags = tags.map((tag: TagType) => tag.name === name ? {...tag, ...updates} : tag);
		setTags(newTags);
	};

	const toggleTag = (name: string) => {
		const newTags = tags.map((tag: TagType) => tag.name === name ? {...tag, checked:!tag.checked} : tag);
		setTags(newTags);
	}

	return ({tags, setTags, selectTags, updateTag, toggleTag} as const);
};