import {Button} from "@/components/ui/button";
import {type TagType, useTagStore} from "@/vol_apps/tag/tag_atom";
import {type TileType, useTileStore} from "@/vol_apps/tile/tile_atom";
import {RefreshCw} from "lucide-react";
import {useState} from "react";

export const TagUpdate = () => {
	const ani_time = 1.0;
	const [isSpinning, setIsSpinning] = useState(false);

	//这里使用了useTileStore可能不太好，为了解耦，我们后续可以直接从localforage中尝试获取目标atom存储值作为中间变量。
	//即使不存在

	const {tiles} = useTileStore();
	const {setTags} = useTagStore();

	const handleClick = () => {
		// 动画效果
		if (!isSpinning) {
			setIsSpinning(true);
			setTimeout(() => setIsSpinning(false), ani_time * 1000);
		}

		// 更新tags
		// 接受数组对象，item内含meta，meta内含tags(可选),
		// tags:string[]

		const allUniqueTags = [...new Set(tiles.flatMap((tile: TileType) => tile.meta?.tags || []))]
			.filter((tag) => tag !== "");
		// console.log(allUniqueTags);
		//注意，如果tile.meta.tags不存在，会返回一个undefined作为元素，所以我们直接用[] 兜底
		const newTags = allUniqueTags.map(tag => ({name: tag, checked: false}));
		setTags(newTags);
	};

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

export const Tags = () => {
	const {tags, toggleTag} = useTagStore();
	return (
		<div className={"flex flex-wrap items-center px-4 py-2 gap-4 w-[90%] mx-auto"}>
			{tags.map((tag: TagType) => (
				<Button
					key={tag.name} variant={tag.checked ? "default" : "link"} onClick={() => toggleTag(tag.name)}
					className={tag.checked
						? "text-white bg-[#0078d7] hover:bg-[#0078d7]"
						: "text-white bg-transparent hover:bg-transparent "
					}>
					{tag.name}
					{/*{tag.checked && <BadgeCheckIcon className={"opacity-60"}/>}*/}
				</Button>
			))}
			<TagUpdate/>
		</div>
	);
};
