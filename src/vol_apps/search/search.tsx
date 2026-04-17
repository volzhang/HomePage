import {SEARCH_ENGINES, useSearchStore} from "@/vol_apps/search/search_store";
import {useEffect, useRef, useState} from "react";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {cn} from "@/lib/utils";
import {Search} from "lucide-react";
import {FloatingPanel} from "@/vol_apps/menu/FloatingPanel";

export const SearchBar = () => {

    const {getEngineInUse, setEngineInUseByName} = useSearchStore()

    const currentEngine = getEngineInUse();

    const rootRef = useRef<HTMLDivElement>(null)
    const inputBoxRef = useRef<HTMLTextAreaElement>(null)

    const [isOpen, setIsOpen] = useState<boolean>(false)

    const close = () => setIsOpen(false)
    const toggle = () => setIsOpen(!isOpen)

    useEffect(() => {
        if (!isOpen) return;

        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (rootRef.current?.contains(target)) return;
            close();
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen]);


    const handleSelect = (v: string) => {
        setEngineInUseByName(v)
        inputBoxRef.current?.focus()
        close()
    }

    const handleSubmit = (keyword: string) => {
        const trimmed = keyword?.trim();

        if (!trimmed) {
            openLinkInNewTab(currentEngine.homeUrl);
            return;
        }

        const urlObj = new URL(currentEngine.url)
        urlObj.searchParams.set(currentEngine.param, keyword)
        openLinkInNewTab(urlObj.toString())
    }

    // ==================== 样式常量 ====================
    const MIN_WIDTH = "min-w-[720px] max-w-[1080px] w-[48vw]"

    const PADDING_LEFT = "py-4 pl-5 pr-5"
    const PADDING_MID = "py-4 pl-2 pr-2"
    const PADDING_RIGHT = "py-4 pl-5 pr-5"

    const TRANSITION_ALL = "transition-all duration-350 ease-out"

    // 主搜索框样式
    const SEARCH_BOX_BASE = cn(
        MIN_WIDTH,
        TRANSITION_ALL,
        "flex", //这里原来是"join"
        "border",
        "bg-white/1 border-sBlue/80",
        "hover:bg-white/99 hover:border-sBlue",
        "focus-within:bg-white/99 hover:border-sBlue",

        "focus-within:shadow-sBlue/30 shadow-[0_10px_30px_rgba(0,0,0,0.2)]",

        "rounded-md overflow-hidden",

        {"bg-white": isOpen},
        {"shadow-sBlue/30 shadow-[0_10px_30px_rgba(0,0,0,0.2)]": isOpen},

        "hover:shadow-sBlue/30",
        "hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
    )

    const SEARCH_ICON_BUTTON = cn(
        "group flex items-start",
        TRANSITION_ALL,
        PADDING_LEFT,
        "text-sBlue hover:bg-sBlue hover:text-white"
    )

    const SEARCH_INPUT_WRAPPER = cn(
        "flex w-full items-start",
        PADDING_MID
    )

    const ENGINE_BUTTON = cn(
        "group flex items-start w-fit ",
        TRANSITION_ALL,
        PADDING_RIGHT,
        "text-sBlue hover:bg-sBlue"
    )

    const ENGINE_NAME = cn(
        "text-[18px] leading-7 h-7 flex items-center justify-center w-full",
        "select-none font-bold gap-1.5",
        "text-sBlue group-hover:text-white"
    )

    // ==================== JSX ====================
    return (
        <div className="relative w-fit mx-auto" ref={rootRef}>
            <div className={SEARCH_BOX_BASE}>
                {/* 搜索图标按钮 */}
                <button
                    onClick={() => handleSubmit(inputBoxRef.current?.value ?? "")}
                    className={SEARCH_ICON_BUTTON}>
                    <div
                        className="text-[18px] leading-7 h-7 flex items-center justify-center text-sBlue group-hover:text-white">
                        <Search strokeWidth={3} className="h-7"/>
                    </div>
                </button>

                {/* 输入框区域 */}
                <div className={SEARCH_INPUT_WRAPPER}>
                    <textarea
                        ref={inputBoxRef}
                        rows={1}
                        className={cn(
                            "resize-none outline-none w-full h-7 leading-7 p-0 border-0",
                            "text-[18px] text-black"
                        )}
                        onInput={(e) => {
                            const el = e.currentTarget
                            el.style.height = "auto"
                            el.style.height = el.scrollHeight + "px"
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                const keyword = e.currentTarget.value
                                e.currentTarget.blur()
                                handleSubmit(keyword)
                            }
                            if (e.key === "Escape") {
                                e.preventDefault()
                                e.currentTarget.blur()
                            }
                        }}
                    />
                </div>

                {/* 引擎选择按钮 */}
                <button onClick={toggle} className={ENGINE_BUTTON}>
                    <div className={ENGINE_NAME}>
                        {currentEngine.name}
                        <span
                            className={cn("text-[12px] transition-transform duration-200 opacity-50", isOpen && "rotate-180")}>▼</span>
                    </div>
                </button>
            </div>

            {/* dropdown */}
            {<FloatingPanel show={isOpen}>
                <div className={cn(
                    "absolute right-0 top-full mt-2 w-fit min-w-34",
                    "border-4 border-background rounded-md shadow-xl",
                    "bg-background text-foreground select-none overflow-hidden z-10",
                    "flex flex-row-reverse"
                )}>
                    {[...SEARCH_ENGINES]
                        .sort((a, b) => a.pos - b.pos)
                        .map(engine => (
                            <button type="button" key={engine.id} onClick={(e) => {
                                e.stopPropagation()
                                handleSelect(engine.name)
                            }}
                                    className={cn(
                                        "px-4 py-3 font-medium text-xl",
                                        "hover:bg-foreground/15 border-none rounded-sm",
                                        currentEngine.name === engine.name && "text-sBlue font-bold"
                                    )}
                            >
                                {engine.name}
                            </button>

                        ))
                    }
                </div>
            </FloatingPanel>}


        </div>
    )
}