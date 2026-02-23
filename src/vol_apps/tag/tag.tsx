import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {Spinner} from "@/components/ui/spinner";
import {cn} from "@/lib/utils";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {BookmarkIcon, LoaderCircle} from "lucide-react";
import {useState} from "react";
import {useTranslation} from "react-i18next";

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
								  "size-6",
								  isBroadMatches
									  ? "text-ring hover:text-[#0078d7]"
									  : "text-[#0078d7] fill-[#0078d7]",
							  )}/>
			</HoverCardTrigger>
			<HoverCardContent className="w-auto" side="top" sideOffset={16}>
				<div className="text-[13px]">
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

export const TagUpdate = () => {
	const {t} = useTranslation("tag");
	const {tiles, updateTags} = useTileStore();
	const [isUpdate, setIsUpdate] = useState<boolean>(false);

	const handleClick = () => {
		setIsUpdate(true);
		const timerPromise = new Promise(resolve => setTimeout(resolve, 1000));
		const updatePromise = Promise.resolve().then(() => updateTags(tiles));
		Promise.all([timerPromise, updatePromise]).finally(() => {
			setIsUpdate(false);
		});
	};

	return (
		<HoverCard openDelay={0} closeDelay={0}>
			<HoverCardTrigger asChild>
				{isUpdate
					? <Spinner className={"size-5 text-[#0078d7]"}></Spinner>
					: <LoaderCircle className={"size-5 text-ring hover:text-[#0078d7]"} onClick={handleClick}/>}
			</HoverCardTrigger>
			<HoverCardContent className="w-auto" side="top" sideOffset={16}>
				<div className="text-[13px]">
					{t("Click to sync tags")}
				</div>
			</HoverCardContent>
		</HoverCard>
	);
};

export const TagComponent = () => {
	const {t} = useTranslation("tag");
	const {
		tags, toggleTag, isBroadMatches, setIsBroadMatches,
		untaggedChecked, setUntaggedChecked, hasUntaggedTiles
	} = useTileStore();

	const Tags = tags.map((tag) => (
		<Button
			key={tag.id} variant={tag.checked ? "default" : "outline"}
			onClick={() => toggleTag(tag.id)}
			className={cn(tag.checked
				? "text-white bg-[#0078d7] hover:bg-[#0078d7] border-none"
				: "border-none"
			)}>
			{tag.name}
		</Button>
	))

	return (
		<>
			<div className={cn(
				"animate-fade-in-scale-1000",
				"flex flex-wrap items-center px-8 pb-3 gap-3 mx-auto",
				"w-[85%] min-h-9",
				// "border border-border",
			)}>
				{Tags}
				{
					hasUntaggedTiles() || untaggedChecked ?
						<Button variant={untaggedChecked ? "default" : "outline"}
								onClick={() => (setUntaggedChecked(!untaggedChecked))}
								className={cn(untaggedChecked
									? "text-white bg-[#0078d7] hover:bg-[#0078d7] border-none"
									: "border-none"
								)
								}>
							{t("Untagged")}
						</Button>
						: null
				}
				<BroadMatches isBroadMatches={isBroadMatches} handleOnClick={
					() => setIsBroadMatches(!isBroadMatches)
				}/>
				<TagUpdate/>
			</div>
		</>

	);
};