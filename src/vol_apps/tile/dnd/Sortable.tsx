// Sortable.tsx
import {type ReactNode} from "react";
import {useSortable} from "@dnd-kit/react/sortable";
import {DragDropProvider} from "@dnd-kit/react";
import {cn} from "@/lib/utils.js";
import {PointerActivationConstraints, PointerSensor} from "@dnd-kit/dom";


export type SortableItem = {
    id: number;
    index: number;
    content: ReactNode;
};

const SortableItemComponent = ({id, index, content}: SortableItem) => {
    const {ref, handleRef, isDragging} = useSortable({id, index});
    return (
        <div ref={ref} className={cn({"opacity-66": isDragging})}>
            {/* <div ref={handleRef}> ensure content can be dragged */}
            <div ref={handleRef}>{content}</div>
        </div>
    );
}

const sensors = [
    PointerSensor.configure({
        activationConstraints: [
            new PointerActivationConstraints.Delay({
                value: 80,
                tolerance: 8
            }),
        ],
    }),
];

type SortableProviderProps = {
    items: SortableItem[];
    onDragEnd: (e: any) => void;
};

export const SortableProvider = ({items, onDragEnd}: SortableProviderProps) => {
    return (
        <DragDropProvider sensors={sensors} onDragEnd={onDragEnd}>
            {items.map(item => (
                <SortableItemComponent
                    key={item.id}
                    id={item.id}
                    index={item.index}
                    content={item.content}
                />
            ))}
        </DragDropProvider>
    );
};

