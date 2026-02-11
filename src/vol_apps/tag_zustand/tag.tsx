import {Button} from "@/components/ui/button";
import {useTagStore} from "@/vol_apps/tag_zustand/tag_store";
import {type Tile, useTileStore} from "@/vol_apps/tile_zustand/tile_store";
import {RefreshCw} from "lucide-react";
import {useEffect, useState} from "react";

export const TagUpdate = () => {
	const ani_time = 0.5;
	const [isSpinning, setIsSpinning] = useState(false);

	//这里使用了useTileStore可能不太好，为了解耦，我们后续可以直接从localforage中尝试获取目标atom存储值作为中间变量。
	//以后再优化，先用着

	const {tiles} = useTileStore();
	const {selectedTags, setTags} = useTagStore();

	const handleClick = () => {
		// 动画效果
		if (!isSpinning) {
			setIsSpinning(true);
			setTimeout(() => setIsSpinning(false), ani_time * 1000);
		}
		// 更新tags
		updateTags();
	};

	const updateTags = () => {
		// 接受数组对象，item内含meta，meta内含tags(可选),
		// tags:string[]
		const allUniqueTags = [
			...new Set(
				tiles.flatMap((tile: Tile) => tile.meta.tags || [])
			)
		].filter((tag) => tag !== "");
		// console.log(allUniqueTags);
		//注意，如果tile.meta.tags不存在，会返回一个undefined作为元素，所以我们直接用[] 兜底

		const newTags = allUniqueTags.map((name, id) => {
			const checked = selectedTags().includes(name);
			return {id, name, checked};
		});
		setTags(newTags);
	};

	// tiles变化时可以自动更新，可以更精确，但是先这么用着。
	useEffect(() => {
		updateTags();
	}, [tiles]);

	return (
		<>
			<style>{`
                    @keyframes spin-once {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(720deg); }
                    }
                    .animate-spin-once {
                        animation: spin-once ${ani_time}s ease-out;
                        animation-iteration-count: 1;
                    }
                `}
			</style>
			<Button variant={"ghost"} className={"bg-transparent hover:bg-transparent"} onClick={handleClick} disabled={isSpinning}>
				<RefreshCw color={"white"} className={isSpinning ? "animate-spin-once" : ""}/>
			</Button>
		</>

	);
};

export const TagComponent = () => {
	const {tags, toggleTag} = useTagStore();
	return (
		<>
			<style>{`
                @keyframes fade-in-scale {
                  0% { opacity: 0; transform: scale(0.98); }
                  100% { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                  animation: fade-in-scale 0.5s ease-out;
                }
            `}</style>

			<div className={"animate-fade-in-scale flex flex-wrap items-center px-8 pb-3 gap-3 w-[85%] mx-auto"}>
				{tags.map((tag) => (
					<Button
						key={tag.id} variant={tag.checked ? "default" : "link"} onClick={() => toggleTag(tag.id)}
						className={tag.checked
							? "text-white bg-[#0078d7] hover:bg-[#0078d7]"
							: "text-white bg-transparent hover:bg-transparent "
						}>
						{tag.name}
					</Button>
				))}
				<TagUpdate/>
			</div>
		</>

	);
};

export function DelayedTags() {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setReady(true), 120); // 80~150ms 通常够了
		return () => clearTimeout(t);
	}, []);

	if (!ready) return (

		<>
			<style>{`
                @keyframes fade-in-scale {
                  0% { opacity: 0; transform: scale(0.98); }
                  100% { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                  animation: fade-in-scale 0.5s ease-out;
                }
            `}</style>
			<div className={"animate-fade-in-scale flex flex-wrap items-center px-8 pb-3 gap-3 w-[85%] mx-auto"}>
				<TagUpdate/>
			</div>
		</>
	);

	return <TagComponent/>;
}