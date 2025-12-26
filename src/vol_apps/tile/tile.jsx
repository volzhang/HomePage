import {cn}                                                              from "@/lib/utils";
import {useTileStore}                                                    from "@/vol_apps/tile/tile_atom";
import {useTileUiStore}                                                  from "@/vol_apps/tile/tile_ui_atom";
import {closestCenter, DndContext, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, rectSortingStrategy, SortableContext, useSortable}    from "@dnd-kit/sortable";
import {CSS}                                                             from "@dnd-kit/utilities";

export const Tile = ({
						 isPreview = false,
						 isDragging = false,
						 editable = false,
						 tile,
						 onRightClick = () => null,
					 }) => {
	const handleRightClick = (e) => {
		onRightClick(e);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") e.preventDefault();
	};

// 内部内容组件
	const TileInner = () => (
		<div
			draggable={false}
			onContextMenu={handleRightClick}
			className={cn(
				"select-none w-36 h-36 mx-auto border-4 border-white/40 rounded-[10%] flex flex-col items-center justify-between pt-2 pb-px bg-white",
				"transition-[shadow, transform] duration-250 delay-0 ease-linear",
				{"hover:shadow-[#0078d7]/50 hover:shadow-xl": !isDragging},
			)}>
			<img draggable={false} className={`mx-auto w-24 h-24 object-contain`} src={tile.meta.icon} alt={tile.meta.alt}/>
			<div className={`w-fit h-fit text-[14px] text-gray-700 font-[550]`}>
				{tile.name}
			</div>
		</div>
	);

	const Alink = ({children}) => {
		return (
			<a
				draggable={false} className={`w-fit h-fit flex`} target="_blank" href={tile.href} rel="noopener noreferrer"
				onKeyDown={handleKeyDown}
			>
				{children}
			</a>
		);
	};

	return (
		isPreview || isDragging || editable
			? <TileInner/>
			: <Alink><TileInner/></Alink>
	);
};

export const Tiles = () => {
	const {tiles} = useTileStore();
	return (
		<div className="flex flex-wrap gap-5">
			{tiles.map((tile) => (<Tile key={tile.id} tile={tile}/>))}
		</div>
	);
};

// 注意react组件的传参必须是形如{参数...}，即使只有1个参数。
const SortableTile = ({tile}) => {
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

	const {setTileUiInEdit, setTileUiVisible} = useTileUiStore();

	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes}>
			<Tile tile={tile} isDragging={isDragging} editable={true} onRightClick={
				(e) => {
					e.preventDefault();
					setTileUiInEdit(tile.id);
					setTileUiVisible(true);
				}
			}/>
		</div>
	);
};

// 参数 tiles，表示传入 TileType[]
export const SortableTiles = () => {
	const {tiles, setTiles} = useTileStore();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				delay: 0,
				tolerance: 0
			}
		}));

	const handleDragEnd = (event) => {
		const {active, over} = event;

		if (over && active.id !== over.id) {
			const oldIndex = tiles.findIndex((t) => t.id === active.id);
			const newIndex = tiles.findIndex((t) => t.id === over.id);
			const newTiles = arrayMove(tiles, oldIndex, newIndex);
			setTiles(newTiles);
		}
	};

	return (
		<div className="flex flex-wrap gap-5">
			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={tiles.map(tile => tile.id)} strategy={rectSortingStrategy}>
					{tiles.map((tile) => (<SortableTile key={tile.id} tile={tile}/>))}
				</SortableContext>
			</DndContext>
		</div>
	);
};
