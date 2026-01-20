import localforage from "localforage";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

type Tag = {
	id: number; //唯一
	name: string;
	checked: boolean;
}

type tagStoreState = {
	tags: Tag[];
}

type TagStoreActions = {
	//基本API
	setTags: (tags: TagStore["tags"]) => void;
	updateTag: (id: Tag["id"], updates: Partial<Tag>) => void;
	toggleTag: (id: Tag["id"]) => void;
	//选择视图
	allTags: () => string[];
	selectedTags: () => string[];

}

type TagStore = tagStoreState & TagStoreActions

export const useTagStore = create<TagStore>()(
	persist(
		(set, get) => ({
			tags: [],
			allTags: () => get().tags.map((tag) => tag.name),
			selectedTags: () => {
				const tags = get().tags.filter((tag) => tag.checked) || [];
				return tags.map((tag) => tag.name);
			},

			setTags: (tags) => set({tags}),
			updateTag: (id, updates) => set((state) => {
				const tags = state.tags.map((tag) => tag.id === id ? {...tag, ...updates} : tag);
				return {tags};
			}),
			toggleTag: (id) => set((state) => {
				const tags = state.tags.map((tag) => tag.id === id ? {...tag, checked: !tag.checked} : tag);
				return {tags};
			})

		}),
		{
			name: "tag",
			storage: createJSONStorage(() => localforage),
		}
	)
);

