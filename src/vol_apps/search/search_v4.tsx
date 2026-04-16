import {SEARCH_ENGINES, useSearchStore} from "@/vol_apps/search/search_store";
import {useEffect, useRef, useState} from "react";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {cn} from "@/lib/utils";
import {Search} from "lucide-react";

export const SearchUi = () => {

    const {getEngineInUse, setEngineInUseByName} = useSearchStore()

    const currentEngine = getEngineInUse();

    const rootRef = useRef<HTMLDivElement>(null)
    const inputBoxRef = useRef<HTMLTextAreaElement>(null)

    const [isOpen, setIsOpen] = useState<boolean>(false)
    const close = () => setIsOpen(false)
    const toggle = () => setIsOpen(!isOpen)

    const handleSelect = (v: string) => {
        setEngineInUseByName(v)
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

    useEffect(() => {
        if (!isOpen) return
        const handler = (e: MouseEvent) => {
            const target = e.target as Node
            if (rootRef.current?.contains(target)) return
            close()
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") close()
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [isOpen])


    const MIN_WIDTH = "min-w-[720px] max-w-[1080px] w-[48vw]"

    const PADDING_LEFT = "py-4 pl-5 pr-5"
    const PADDING_MID = "py-4 pl-2 pr-2"
    const PADDING_RIGHT = "py-4 pl-5 pr-5"

    return (
        <div className="relative w-fit mx-auto" ref={rootRef}>
            <div className={cn("join",
                // "border border-primary ",
                "border border-sBlue bg-white",
                "rounded-md",
                // "text-base-content",
                "shadow",
                "overflow-hidden",
                MIN_WIDTH
            )}>
                <button
                    onClick={() => handleSubmit(inputBoxRef.current?.value ?? "")}
                    className={cn(
                        "group",
                        // "hover:text-base-100 hover:bg-primary",
                        "flex items-start",
                        "transition-colors duration-200 ease-out",
                        PADDING_LEFT,
                        "text-sBlue hover:bg-sBlue hover:text-white",
                    )}>
                    <div
                        className={cn(
                            // "text-primary group-hover:text-base-100",
                            "text-[18px] leading-7 h-7",
                            "flex items-center justify-center",
                            "text-sBlue group-hover:text-white"
                        )}>
                        <Search strokeWidth={3} className={"h-7"}/>
                    </div>
                </button>
                <div className={cn("flex w-full items-start", PADDING_MID)}>
                    <textarea ref={inputBoxRef} rows={1}
                              className={cn(
                                  "resize-none outline-none",
                                  "w-full h-7 leading-7 p-0 border-0",
                                  "text-[18px]",
                                  "text-black"
                              )}
                              onInput={(e) => {
                                  const el = e.currentTarget
                                  el.style.height = "auto"
                                  el.style.height = el.scrollHeight + "px"
                              }}
                              onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault()
                                      const keyword = e.currentTarget.value.trim()
                                      handleSubmit(keyword)
                                  }
                              }}
                    />
                </div>

                <button onClick={toggle} className={cn(
                    "group ",
                    // "hover:text-base-100 hover:bg-primary",
                    "flex items-start",
                    "w-fit",
                    // "min-w-34",
                    PADDING_RIGHT,
                    "transition-colors duration-200 ease-out",
                    "text-sBlue hover:bg-sBlue",
                )}>
                    <div className={cn(
                        // "text-primary group-hover:text-base-100",
                        "text-[18px] leading-7 h-7",
                        "flex items-center justify-center",
                        "w-full",
                        "select-none font-bold",
                        "gap-1.5",
                        "text-sBlue group-hover:text-white ",
                        // "group-focus:text-white",
                    )}>
                        {currentEngine.name}
                        <span
                            className={cn("text-[12px] transition-transform duration-200 opacity-50", isOpen && "rotate-180")}>▼</span>
                    </div>
                </button>
            </div>

            {/* dropdown */}
            <div className={cn(
                "animate-pop", isOpen ? "animate-pop-open" : "animate-pop-close",
                "absolute right-0 top-full mt-1.5 w-fit min-w-34",
                "border-4 border-background",
                "rounded-md shadow-xl",
                "bg-background text-foreground",
                "select-none",
                "overflow-hidden",
                "z-10",
            )}
            >
                {SEARCH_ENGINES
                    .sort((a, b) => a.pos - b.pos)
                    .map(engine => (
                            <div key={engine.id} onClick={(e) => {
                                e.stopPropagation() // consume click event
                                handleSelect(engine.name)
                            }}
                                 className={cn(
                                     // "flex flex-row ",
                                     "px-3 py-2 font-medium text-md",
                                     "hover:bg-foreground/15",
                                     "border-none rounded-sm",
                                     currentEngine.name === engine.name && "text-sBlue font-bold",
                                 )}
                            >
                                {engine.name}
                            </div>
                        )
                    )}
            </div>
        </div>
    )
}