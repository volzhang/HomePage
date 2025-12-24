import {Card, CardContent} from "@/components/ui/card";
import {
	Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
	type CarouselApi,
} from "@/components/ui/carousel";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {cn} from "@/lib/utils";
import {useBgStore} from "@/vol_apps/bg/bg_atom";
import {useEffect, useState} from "react";
import {SortableTiles, Tiles} from "@/vol_apps/tile/tile";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";

const arr = [
	{id: 0, content: "第一页"},
	{id: 1, content: "第二页"},
	{id: 2, content: "第三页"},
];

const width_max = "w-[92%]";
const height_max = "h-[60vh]";
const start_index = 0;

export const Desktop = () => {
	const {bgUi} = useBgStore()
	const [inEdit, setInEdit] = useState<boolean>(false);
	const [api, setApi] = useState<CarouselApi>();
	const [currentIndex, setCurrentIndex] = useState(start_index);
	const opts = {
		startIndex: start_index,
		watchDrag: !inEdit, //这是手势滑动Carousel的开关
	};

	useEffect(() => {
		if (!api) return;
		const onSelect = () => {
			const index = api.selectedScrollSnap(); // 获取当前页索引
			setCurrentIndex(index);
		};
		onSelect();
		api.on("select", onSelect);
		return () => {
			api.off("select", onSelect);
		};
	}, [api]);

	return (
		<div className={cn("flex flex-col mx-auto gap-2 items-center", width_max)}>
			<Tabs defaultValue={String(start_index)} value={String(currentIndex)}>
				<TabsList>
					{arr.map((item, index) =>
						<TabsTrigger key={index} value={String(index)} onClick={() => {
							api?.scrollTo(index);
						}}>{item.content}</TabsTrigger>
					)}
				</TabsList>
			</Tabs>
			<Carousel setApi={setApi} opts={opts} className={"w-full"}>
				<CarouselContent>
					{arr.map((_item, index) =>
						<CarouselItem key={index}>
							<Card className={cn(
								{"bg-white/8": inEdit},
								{"bg-white/4": !inEdit},
								"border-white/5"
							)}>
								<CardContent className={cn(height_max)}>
									{/*<span className="text-4xl font-semibold">{item.content}</span>*/}
									{inEdit ? <SortableTiles/> : <Tiles/>}
								</CardContent>
							</Card>
						</CarouselItem>
					)}
				</CarouselContent>
				<CarouselPrevious className={cn(
					api?.canScrollPrev() && "opacity-10!",
					!api?.canScrollPrev() && "opacity-0!",
					bgUi && "opacity-0!", //这个组件的层级内部可能有点特殊
				)}/>
				<CarouselNext className={cn(
					api?.canScrollNext() && "opacity-10!",
					!api?.canScrollNext() && "opacity-0!",
					bgUi && "opacity-0!",
				)}/></Carousel>
			<div className={"p-1"}/>
			<div className="flex items-center space-x-2">
				<Label className={cn("text-xl font-serif",
					{"opacity-25": !inEdit},
				)}>
					{`编辑模式 ${inEdit ? "开" : "关"}`}
					<Switch defaultChecked={inEdit} onCheckedChange={setInEdit}/>
				</Label>
			</div>
		</div>
	);
};
