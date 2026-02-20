import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {cn} from "@/lib/utils";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {BookmarkIcon} from "lucide-react";

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
								  "transition-all duration-100",
								  "hover:opacity-100",
								  "scale-90",
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

export const TagComponent = () => {
	const {t} = useTranslation("tag");
	const {tags, toggleTag, isBroadMatches, setIsBroadMatches,
		untaggedChecked, setUntaggedChecked, hasUntaggedTiles} = useTileStore();

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
						key={tag.id} variant={tag.checked ? "default" : "outline"}
						onClick={() => toggleTag(tag.id)}
						// onContextMenu={(e) => e.preventDefault()}
						className={cn(tag.checked
							? "text-white bg-[#0078d7] hover:bg-[#0078d7] border-none"
							: "border-none"
							)

						}>
						{tag.name}
					</Button>
				))}
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
						:null
				}
				<BroadMatches isBroadMatches={isBroadMatches} handleOnClick={
					() => setIsBroadMatches(!isBroadMatches)
				}/>
			</div>
		</>

	);
};