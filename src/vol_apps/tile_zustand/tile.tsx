import {cn} from "@/lib/utils";
import {useTagStore} from "@/vol_apps/tag_zustand/tag_store";
import {type Tile, useTileStore} from "@/vol_apps/tile_zustand/tile_store";
import {closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, rectSortingStrategy, SortableContext, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import type {MouseEvent, KeyboardEvent, JSX} from "react";
import {TileUi} from "@/vol_apps/tile_zustand/tile_ui";

interface TileProps {
	tile: Tile,
	isPreview?: boolean,
	isDragging?: boolean,
	onRightClick?: (e: MouseEvent) => void,
}

export const TileComponent = ({
								  tile,
								  isPreview = false,
								  isDragging = false,
								  onRightClick = () => null
							  }: TileProps) => {

	const handleRightClick = (e: MouseEvent) => onRightClick(e);
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") e.preventDefault();
	};
	//这里可以优化成资源清理版本，实际意义可能不大（因为基本不变化），保持代码简单
	const imgSrc = tile.meta.icon;
	const TileInner = () => (
		<div
			draggable={false}
			onContextMenu={handleRightClick}
			className={cn(
				"select-none w-36 h-36 mx-auto border-4 border-white/40 rounded-[10%] flex flex-col items-center justify-between pt-2 pb-px bg-white",
				"transition-[shadow, transform] duration-250 delay-0 ease-linear",
				{"hover:shadow-[#0078d7]/50 hover:shadow-xl": !isDragging},
			)}>
			<img draggable={false} className={`mx-auto w-24 h-24 object-contain`} src={imgSrc} alt={tile.meta.alt}/>
			<div className={`w-fit h-fit text-[14px] text-gray-700 font-[550]`}>
				{tile.meta.name}
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

const SortableTile = ({tile}: { tile: Tile }) => {
	const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: tile.id,});
	// 注意，style和tailwindcss会竞争，这里，我们把阴影效果写成一式两份，独立处理。否则，dragging时，会有阴影闪烁
	const style = {
		transform: CSS.Transform.toString(transform),
		transition: transition,
		borderRadius: isDragging
			? "10%"
			: undefined,
		boxShadow: isDragging
			? "0 15px 15px -3px rgba(0, 120, 215, 0.6)"
			: undefined,
		zIndex: isDragging
			? "1"
			: "auto"
	};

	const {setTileInEditId, setTileUiVisible} = useTileStore();

	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes}>
			<TileComponent tile={tile} isDragging={isDragging} onRightClick={
				(e) => {
					e.preventDefault();
					setTileInEditId(tile.id);
					setTileUiVisible(true);
				}
			}/>
		</div>
	);
};

export const SortableTiles = ({showTiles}: { showTiles: Tile[] }) => {
	const {tiles, setTiles, tilesByTag} = useTileStore();

	// 这里,与标签系统的对接，我直接硬编码了
	const {selectedTags} = useTagStore();
	const displayTiles = showTiles ?? tilesByTag(selectedTags(), "ANY");

	const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {delay: 100, tolerance: 0}}));

	const handleDragEnd = (event: DragEndEvent) => {
		const {active, over} = event;
		if (over && active.id !== over.id) {
			const oldIndex = tiles.findIndex((t) => t.id === active.id);
			const newIndex = tiles.findIndex((t) => t.id === over.id);
			const newTiles = arrayMove(tiles, oldIndex, newIndex);
			setTiles(newTiles);
		}
	};

	return (
		<>
		<div className="flex flex-wrap px-6 py-6 gap-7">
			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={tiles.map(tile => tile.id)} strategy={rectSortingStrategy}>
					{displayTiles.map((tile) => (<SortableTile key={tile.id} tile={tile}/>))}
				</SortableContext>
			</DndContext>
		</div>
		<TileUi/>
		</>
	);
};