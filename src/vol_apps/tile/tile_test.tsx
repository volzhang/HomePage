import {cn} from "@/lib/utils";

export const TileTest = () => {
	return (
		<div className={cn(
			"size-36 h-36",
			"bg-white",
			"rounded-xl",
			"shadow-[0_6px_12px_-2px_rgba(50,50,93,0.25),0_3px_7px_-3px_rgba(0,0,0,0.3)]",
			"transition-all duration-300 ease-in-out",
			"hover:bg-[#fdfdfd]",
			"hover:shadow-[0_2px_1px_rgba(0,0,0,0.09),0_4px_2px_rgba(0,0,0,0.09),0_8px_4px_rgba(0,0,0,0.09),0_16px_8px_rgba(0,0,0,0.09),0_32px_16px_rgba(0,0,0,0.09)]",
			"hover:-translate-y-1 hover:scale-[1.03]"
			)}>
			测试瓷砖
		</div>
	);
};