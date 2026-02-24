import {cn} from "@/lib/utils";

import {type Tile, useTileStore} from "@/vol_apps/tile/tile_store";
import {closestCenter, DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, rectSortingStrategy, SortableContext, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {type MouseEvent, type KeyboardEvent, type JSX, useEffect, useState, memo, useMemo} from "react";
import {useTranslation} from "react-i18next";

interface TileProps {
	tile: Tile,
	isPreview?: boolean,
	isDragging?: boolean,
	onRightClick?: (e: MouseEvent) => void,
	customIcon?: JSX.Element | null,
	customName?: string,
}

export const TileComponent = ({
								  tile,
								  isPreview = false,
								  isDragging = false,
								  onRightClick = () => null,
								  customIcon = null,
								  customName = "",
							  }: TileProps) => {

	const handleRightClick = (e: MouseEvent) => onRightClick(e);
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") e.preventDefault();
	};

	const imgSrc = tile.meta.icon;
	const TileInner = () => (
		<div
			draggable={false}
			onContextMenu={handleRightClick}
			className={cn(
				"border border-[#eeeeee] bg-[#f9f9f9]",
				"text-black text-[13.5px] font-[550]",
				"select-none w-36 h-36 mx-auto",
				"rounded-[10%] flex flex-col items-center justify-between pt-2 pb-px",
				"transition-[shadow, transform] duration-250 delay-0 ease-linear",
				{"hover:shadow-[#0078d7]/50 hover:shadow-xl": !isDragging},
			)}>
			{customIcon
				? <div className={"mx-auto w-24 h-24"}>
					{customIcon}
				</div>
				: <img draggable={false} className={"mx-auto w-24 h-24 object-contain"} src={imgSrc} alt={tile.meta.alt}/>
			}

			<div className={"w-fit h-fit"}>
				{customName
					? customName
					: tile.meta.name
				}
			</div>
		</div>
	);
	const Alink = ({children}: { children: JSX.Element }) => {
		return (
			<a draggable={false} className={`w-fit h-fit flex`} target="_blank" href={tile.url} rel="noopener noreferrer"
			   onKeyDown={handleKeyDown}>
				{children}
			</a>
		);
	};
	return (isPreview || isDragging ? <TileInner/> : <Alink><TileInner/></Alink>);
};

const SortableTile = memo(({ tile, allowFadeIn }: { tile: Tile; allowFadeIn: boolean }) => {
	const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: tile.id});

	// 注意，style和tailwindcss会竞争，这里，我们把阴影效果写成一式两份，独立处理。否则，dragging时，会有阴影闪烁
	const style = {
		transform: CSS.Transform.toString(transform),
		transition: transition,
		borderRadius: isDragging ? "10%" : undefined,
		boxShadow: isDragging ? "0 15px 15px -3px rgba(0, 120, 215, 0.6)" : undefined,
		zIndex: isDragging ? "1" : "auto"
	};

	const {setTileInEditId, setTileUiVisible} = useTileStore();

	const shouldAnimate = allowFadeIn && !isDragging;

	return (
		<div
			className={cn(
				{"animate-fade-in-scale": shouldAnimate},
				{"no-animation": isDragging},
				{"opacity-25": isDragging}    //使用了DragOverlay，把拖拽时的本体虚化，更美观
			)}
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
		>
			<TileComponent
				tile={tile}
				isDragging={isDragging}
				onRightClick={(e) => {
					e.preventDefault();
					setTileInEditId(tile.id);
					setTileUiVisible(true);
				}}
			/>
		</div>
	);
});

SortableTile.displayName = "SortableTile"; //这是react调试用的，没什么用

export const SortableTiles = ({showTiles}: { showTiles?: Tile[] }) => {
	const {tiles, setTiles, tilesByTag, isBroadMatches} = useTileStore();
	const {t} = useTranslation("tile");

	const displayTiles = showTiles ?? tilesByTag(isBroadMatches ? "ANY" : "ALL")!;

	const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {delay: 150, tolerance: 20}}));

	const handleDragEnd = (event: DragEndEvent) => {
		const {active, over} = event;
		if (over && active.id !== over.id) {
			const oldIndex = tiles.findIndex((t) => t.id === active.id);
			const newIndex = tiles.findIndex((t) => t.id === over.id);
			setTiles(arrayMove(tiles, oldIndex, newIndex));
		}
	};

	// ==================== 動畫控制 ====================
	const currentDisplayIds = useMemo(
		() => displayTiles.map(t => t.id).sort((a, b) => a - b).join(","),
		[displayTiles]
	);

	const [allowFadeIn, setAllowFadeIn] = useState(true);

	useEffect(() => {
		setAllowFadeIn(true);                    // 立即開啟動畫
		const timer = setTimeout(() => {
			setAllowFadeIn(false);
		}, 800);  //这个时间，比动画时间长一点（600+200）

		return () => clearTimeout(timer);
	}, [currentDisplayIds]);

	const filteredTiles = displayTiles.map((tile) => (
		<SortableTile
			key={tile.id}
			tile={tile}
			allowFadeIn={allowFadeIn}
		/>
	));

	// DragOverlay 自定义渲染拖拽的个体
	const [activeId, setActiveId] = useState<string | number | null>(null); // 当前拖拽的 id
	const activeTile = tiles.find((tile) => tile.id === activeId);
	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id);
	};


	return (
		<div className="flex flex-wrap px-6 py-6 gap-7">
			<DndContext sensors={sensors}
						collisionDetection={closestCenter}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						// autoScroll={false}  //使用了DragOverlay，可以默认开了。
			>
				<SortableContext
					items={displayTiles.map(tile => tile.id)}
					strategy={rectSortingStrategy}>
					{filteredTiles.length > 0 ? (
						filteredTiles
					) : (
						<div className={cn(
							"flex mx-auto items-center justify-center text-3xl text-muted-foreground h-36",
							"animate-fade-in-scale-300"
						)}>
							{t("No matched tile")}
						</div>
					)}
				</SortableContext>
				<DragOverlay>
					{activeTile ? (
						<TileComponent
							tile={activeTile}
							isDragging={true}
						/>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
};