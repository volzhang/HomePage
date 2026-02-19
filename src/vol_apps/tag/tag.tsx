import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {cn} from "@/lib/utils";
import {type Tile, useTileStore} from "@/vol_apps/tile/tile_store";
import {RefreshCw, BookmarkIcon} from "lucide-react";
import {
	useEffect, useState,
	// useId
} from "react";
import {useTranslation} from "react-i18next";

export const TagUpdate = () => {
	const ani_time = 0.5;
	const [isSpinning, setIsSpinning] = useState(false);
	const {tiles, selectedTags, setTags} = useTileStore();

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
		// 接受数组对象，item内含meta，meta内含tags,
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

export const BroadMatches = ({isBroadMatches, handleOnClick}: {
	isBroadMatches: boolean,
	handleOnClick?: () => void,
}) => {
	const {t} = useTranslation("tag");
	return (
		<HoverCard openDelay={0} closeDelay={0}>
			<HoverCardTrigger asChild>
				<BookmarkIcon onClick={handleOnClick}
							  className={cn(
								  "transition-all duration-100",
								  "hover:opacity-100",
								  "scale-75",
								  {"text-white": isBroadMatches},
								  {"hover:text-[#0078d7]": isBroadMatches},

								  {"text-[#0078d7]": !isBroadMatches},
								  {"fill-[#0078d7]": !isBroadMatches}
							  )}/>
			</HoverCardTrigger>
			<HoverCardContent className="w-auto" side="top" sideOffset={16}>
				<div className="text-gray-600 text-[15px]">
					{t(
						"Click to toggle mode \nCurrently: tiles match {{mode}} selected tags",
						{mode: isBroadMatches ? t("ANY") : t("ALL")}
					)
						.split("\n").map((line, i) => (
							<div key={i}>{line.trim()}</div>
						))}
				</div>
			</HoverCardContent>
		</HoverCard>
	);
};

export const TagComponent = () => {
	// const BroadMatches = useId()
	const {tags, toggleTag, isBroadMatches, setIsBroadMatches} = useTileStore();
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
				<BroadMatches isBroadMatches={isBroadMatches} handleOnClick={
					() => setIsBroadMatches(!isBroadMatches)
				}/>
				<TagUpdate/>
			</div>
		</>

	);
};