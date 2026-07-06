import {useCallback, useEffect, useRef} from "react";

export const useKeyboardNavigation = ({open}: { open: boolean}) => {

    // 所有菜单项 DOM
    const itemDOMs = useRef<(HTMLElement | null)[]>([]);

    // 提供给 Option 绑定
    const itemRef = useCallback(
        (index: number) =>
            (node: HTMLElement | null) => {
                itemDOMs.current[index] = node;
            },
        [],
    );

    // 键盘导航
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const current = document.activeElement as HTMLElement | null;
            const currentIndex = itemDOMs.current.indexOf(current);

            let nextIndex: number;

            switch (e.key) {
                case "ArrowDown":
                case "ArrowRight":
                    nextIndex =
                        currentIndex === -1
                            ? 0
                            : currentIndex + 1;
                    break;

                case "ArrowUp":
                case "ArrowLeft":
                    nextIndex =
                        currentIndex === -1
                            ? itemDOMs.current.length - 1
                            : currentIndex - 1;
                    break;

                default:
                    return;
            }

            e.preventDefault();

            if (nextIndex < 0) return;
            if (nextIndex >= itemDOMs.current.length) return;

            itemDOMs.current[nextIndex]?.focus();
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    return {
        itemRef,
    };
}