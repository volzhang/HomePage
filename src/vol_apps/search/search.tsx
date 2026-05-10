import {SEARCH_ENGINES, useSearchStore} from "@/vol_apps/search/search_store";
import {useRef, useState} from "react";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {cn} from "@/lib/utils";
import {Search} from "lucide-react";
import {Select} from "../01_components/01_SelectComponent";

export const SearchBar = () => {
    const {getEngineInUse, setEngineInUseByName} = useSearchStore()
    const [open, setOpen] = useState<boolean>(false)

    const currentEngine = getEngineInUse();
    const inputBoxRef = useRef<HTMLTextAreaElement>(null)

    const handleSelect = (v: string) => {
        setEngineInUseByName(v)
        inputBoxRef.current?.focus()
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
    const MIN_WIDTH = "min-w-[720px] max-w-[1080px] max-w-[48vw] w-[48vw]"
    const PADDING_LEFT = "py-4 pl-[18px] pr-[14px]"
    const PADDING_MID = "py-4 pl-1 pr-1"
    const PADDING_RIGHT = "py-4 pl-5 pr-5"
    const TRANSITION_ALL = "transition-all duration-350 ease-out"

    // 主搜索框样式
    const SEARCH_BOX_BASE = cn(
        MIN_WIDTH,
        TRANSITION_ALL,
        "flex",
        "border",
        "bg-white/1 border-sBlue/80",
        "hover:bg-white/99 hover:border-sBlue",
        "focus-within:bg-white/99 hover:border-sBlue",

        "focus-within:shadow-sBlue/30 shadow-[0_10px_30px_rgba(0,0,0,0.2)]",

        "rounded-md overflow-hidden",

        {"bg-white": open},
        {"shadow-sBlue/30 shadow-[0_10px_30px_rgba(0,0,0,0.2)]": open},

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
        "group flex items-start w-fit",
        TRANSITION_ALL,
        PADDING_RIGHT,
        "text-sBlue hover:bg-sBlue"
    )

    const ENGINE_NAME = cn(
        "text-[18px] leading-7 h-7 flex items-center justify-center w-full",
        "select-none font-bold gap-1.5",
        "text-sBlue group-hover:text-white"
    )

    const SIZE_MAP: Record<number, string> = {
        0: "w-9",
        1: "w-10",
        3: "w-[44px]",
        5: "w-[48px]",
        2: "w-[46px]",

        6: "w-[36px]",
        7: "w-[48px]",
        4: "w-[36px]",
    }

    // ==================== JSX ====================
    return (
        <div className={cn("w-fit mx-auto",
            "mt-[120px] mb-[50px]")}>
            <div className={SEARCH_BOX_BASE}>
                {/* 搜索图标按钮 */}
                <button
                    onClick={() => handleSubmit(inputBoxRef.current?.value ?? "")}
                    className={SEARCH_ICON_BUTTON}>
                    <div
                        className={cn("text-[18px] leading-7 h-7 flex items-center justify-center",
                            "text-sBlue group-hover:text-white select-none")}>
                        {currentEngine.icon
                            ? <img src={currentEngine.icon} className={`${SIZE_MAP[currentEngine.id]} object-cover select-none`}/>
                            : <Search strokeWidth={3} className="h-7"/>}
                    </div>
                </button>

                {/* 输入框区域 */}
                <div className={SEARCH_INPUT_WRAPPER}>
                    <textarea
                        ref={inputBoxRef}
                        rows={1}
                        className={cn(
                            "resize-none outline-none w-full h-7 leading-7 p-0 border-0",
                            "text-[18px] text-sBlue focus:text-black hover:text-black transition-colors duration-350",
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
                {/* 引擎选择按钮 直接使用自制组件Select */}
                <Select
                    open={open} onOpenChange={setOpen}
                    value={currentEngine.name} onValueChange={handleSelect}
                    duration={200} exitDuration={200}
                    align={"end"} offset={6}
                >
                    <Select.Trigger>
                        <div className={"w-fit"}>
                            <div className={cn(ENGINE_BUTTON, "h-full")}>
                                <div className={ENGINE_NAME}>
                                    {currentEngine.name}
                                    <Select.RotateIcon/>
                                </div>
                            </div>
                        </div>
                    </Select.Trigger>
                    <Select.Content menuClassName={"flex flex-row-reverse w-fit"}>
                        {[...SEARCH_ENGINES]
                            .sort((a, b) => a.pos - b.pos)
                            .map(engine => (
                                <Select.Option
                                    key={engine.name}
                                    value={engine.name}
                                    checkIconClassName={"hidden"}       //不使用checkIcon
                                    itemClassName={cn("px-4 py-6 text-xl font-medium",
                                        currentEngine.name === engine.name && "text-sBlue font-semibold"
                                    )}>
                                    {engine.name}
                                </Select.Option>
                            ))
                        }
                    </Select.Content>
                </Select>
            </div>
        </div>
    )
}