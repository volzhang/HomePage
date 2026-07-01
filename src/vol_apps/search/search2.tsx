import {initStoreState, useSignal} from "@/vol_apps/04_persist_atoms";
import {cn} from "@/lib/utils.ts";
import {Check, Search} from "lucide-react";
import React, {type FormEventHandler, type KeyboardEventHandler, useMemo} from "react";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink.ts";
import {useFloating} from "@/vol_apps/02_hooks/float/useFloating.ts";
import {useKeyEscapeToClose} from "@/vol_apps/02_hooks/useKeys.ts";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/05_useClickOutsideToClose.ts";
import {useFocusOutsideToClose} from "@/vol_apps/02_hooks/06_useFocusOutsideToClose.ts";
import {useMergeRefs} from "@/vol_apps/02_hooks/01_useMergeRefs.ts";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";

// import search_bing from "@/assets/search_bing.svg";
// import search_google from "@/assets/search_google.png";
// import search_duckduckgo from "@/assets/search_duckduckgo.svg";
// import search_yandex from "@/assets/search_yandex.png";
// import search_baidu from "@/assets/search_baidu.png";
// import search_yahoo from "@/assets/search_yahoo.png";
// import search_brave from "@/assets/search_brave.svg";
// import search_ecosia from "@/assets/search_ecosia.svg";

type SearchEngine = {
    id: number;
    queryStringPrefix: string;      // search engine queryStringPrefix, for example, https://www.bing.com/search?q=
    homepageUrl: string;        // search engine homepage url, for example, https://www.bing.com/
    name: string;
    icon: string;
};

// const defaultEngines: SearchEngine[] = [
//     {id: 0, name: "Bing", queryStringPrefix: "https://www.bing.com/search?q=", homepageUrl: "https://www.bing.com/", icon: search_bing},
//     {id: 1, name: "Google", queryStringPrefix: "https://www.google.com/search?q=", homepageUrl: "https://www.google.com/", icon: search_google},
//     {id: 3, name: "Yandex", queryStringPrefix: "https://yandex.com/search?text=", homepageUrl: "https://yandex.com/", icon: search_yandex},
//     {id: 5, name: "Yahoo!", queryStringPrefix: "https://search.yahoo.com/search?p=", homepageUrl: "https://search.yahoo.com/", icon: search_yahoo},
//     {id: 2, name: "DuckDuckGo", queryStringPrefix: "https://duckduckgo.com/?q=", homepageUrl: "https://duckduckgo.com/", icon: search_duckduckgo},
//     {id: 6, name: "Brave", queryStringPrefix: "https://search.brave.com/search?q=", homepageUrl: "https://search.brave.com/", icon: search_brave},
//     {id: 7, name: "Ecosia", queryStringPrefix: "https://www.ecosia.org/search?q=", homepageUrl: "https://www.ecosia.org/", icon: search_ecosia},
//     {id: 4, name: "Baidu", queryStringPrefix: "https://www.baidu.com/s?wd=", homepageUrl: "https://www.baidu.com/", icon: search_baidu},
// ]

const defaultEngines: SearchEngine[] = [
    {id: 0, name: "Bing", queryStringPrefix: "https://www.bing.com/search?q=", homepageUrl: "https://www.bing.com/", icon: ""},
    {id: 1, name: "Google", queryStringPrefix: "https://www.google.com/search?q=", homepageUrl: "https://www.google.com/", icon: ""},
    {id: 3, name: "Yandex", queryStringPrefix: "https://yandex.com/search?text=", homepageUrl: "https://yandex.com/", icon: ""},
    {id: 5, name: "Yahoo!", queryStringPrefix: "https://search.yahoo.com/search?p=", homepageUrl: "https://search.yahoo.com/", icon: ""},
    {id: 2, name: "DuckDuckGo", queryStringPrefix: "https://duckduckgo.com/?q=", homepageUrl: "https://duckduckgo.com/", icon: ""},
    {id: 6, name: "Brave", queryStringPrefix: "https://search.brave.com/search?q=", homepageUrl: "https://search.brave.com/", icon: ""},
    {id: 7, name: "Ecosia", queryStringPrefix: "https://www.ecosia.org/search?q=", homepageUrl: "https://www.ecosia.org/", icon: ""},
    {id: 4, name: "Baidu", queryStringPrefix: "https://www.baidu.com/s?wd=", homepageUrl: "https://www.baidu.com/", icon: ""},
]

export const searchStore = initStoreState({
    storeName: "search2",
    fields: {
        engineInUseId: 0,
        SearchEngines: [] as SearchEngine[],
        visible: true,
    }
})

export const getEngineById = (engineInUseId: number) => {
    return defaultEngines.find(e => e.id === engineInUseId) ?? defaultEngines[0];
};

const LEADING_HEIGHT = "leading-[44px]"
const BOX_HEIGHT = "h-[60px]"
const TRANSITION = "transition-all duration-350 ease-out"

// wrapper
const WRAPPER = "group flex mx-auto " +
    "min-w-[720px] max-w-[1080px] max-w-[48vw] w-[48vw] " +
    "h-fit border border-sBlue/80 rounded-md overflow-hidden " +
    "focus-within:shadow-sBlue/30 shadow-[0_10px_30px_rgba(0,0,0,0.2)] " +
    "focus-within:bg-white/99 bg-white/1 " +
    "transition-all duration-350 ease-out"

// icon & name
const WRAPPER_FLEX = "flex flex-col justify-start"
const COLORS = "bg-transparent text-sBlue group-hover:bg-white"
const BOX_FLEX = "flex items-center"

const ICON_WRAPPER = cn(WRAPPER_FLEX, COLORS,
    "w-[64px]", "pl-[16px] pr-[12px] select-none",
    TRANSITION)
const ICON_BOX = cn(BOX_FLEX, BOX_HEIGHT)

const NAME_WRAPPER = cn(WRAPPER_FLEX, COLORS,
    "w-fit", "pl-[16px] pr-[20px] select-none",
    TRANSITION)
const NAME_BOX = cn(BOX_FLEX, BOX_HEIGHT, "text-[19px] font-semibold")

// input
const RESET_TEXTAREA = "block w-full resize-none overflow-hidden border-0 p-0 m-0 bg-transparent outline-none"
const TEXTAREA = cn(RESET_TEXTAREA,
    "px-1 py-[8px] text-[23px] group-hover:bg-white focus:text-black text-sBlue",
    TRANSITION,
    LEADING_HEIGHT)

// button
const RESET_BUTTON = "m-0 p-0 outline-0 flex items-center justify-start"
const HOVER = "hover:bg-sBlue hover:text-white"
const FOCUS = "focus:bg-sBlue focus:text-white"
const BUTTON = cn(RESET_BUTTON, FOCUS, HOVER)

const autoResize: FormEventHandler<HTMLTextAreaElement> = (e) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
};

const SearchIcon = () => {
    const {engineInUseId} = useSignal(searchStore("engineInUseId"))
    const engine = getEngineById(engineInUseId)
    const onClick = () => {
        openLinkInNewTab(engine.homepageUrl)
    }
    return (
        <button className={cn(BUTTON, ICON_WRAPPER)} onClick={onClick}>
            <div className={ICON_BOX}><Search strokeWidth={3} size={30}/></div>
        </button>
    )
}


const SearchInput = () => {
    const {engineInUseId} = useSignal(searchStore("engineInUseId"))
    const engine = getEngineById(engineInUseId)

    const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key === "Enter") {
            if (e.shiftKey) return;     // Shift + Enter 什么都不用做，让 textarea 默认插入换行
            e.preventDefault()
            const keyword = e.currentTarget.value
            const prefix = engine.queryStringPrefix
            const url = prefix + encodeURIComponent(keyword)
            openLinkInNewTab(url)
            return;
        }
        if (e.key === "Escape") {
            e.preventDefault()
            e.currentTarget.blur()
        }
    }

    return <textarea
        className={TEXTAREA}
        rows={1}
        onInput={autoResize}
        onKeyDown={onKeyDown}
    />
}

const duration = 250
const exitDuration = 250
const RESET_INPUT = "m-0 p-0 outline-0"
const ITEMS = cn("text-xl w-full px-2 py-1.5 h-fit rounded-[5px]")

const EngineName = () => {
    const [open, setOpen] = React.useState(false)
    const onClick = () => setOpen(!open)
    const onClose = () => setOpen(false)

    const {
        anchorRef,
        floatingRef, floatingStyle,
        floatingPortal, portalMounted
    } = useFloating({
        open,
        direction: 'bottom',
        duration,
        exitDuration,
        align: 'end',
        offset: 8,
    });

    // 关闭行为
    useKeyEscapeToClose(open, onClose);
    const {clickOutsideRef, clickOutsideIgnoreRef} = useClickOutsideToClose({open, onClose});
    const {focusOutsideRef, focusOutsideIgnoreRef} = useFocusOutsideToClose({open: portalMounted, onClose});
    //useFocusOutsideToClose 需要注意，延迟显示的dom需要使用正确的open判断

    const mergedAnchorRef = useMergeRefs(anchorRef, clickOutsideIgnoreRef, focusOutsideIgnoreRef);
    const mergedFloatingRef = useMergeRefs(floatingRef, clickOutsideRef, focusOutsideRef);

    const {engineInUseId} = useSignal(searchStore("engineInUseId"))
    const name = getEngineById(engineInUseId).name

    const RotationIcon = useMemo(() => {
        return <span className={"inline-block text-[16px] translate-y-px translate-x-1"} style={{
            opacity: 0.5,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: `transform ${open ? duration : exitDuration}ms ease-in-out`,
        }}>▼</span>
    }, [open])

    return (
        <>
            <button ref={mergedAnchorRef} className={cn(BUTTON, NAME_WRAPPER)} onClick={onClick}>
                <p className={NAME_BOX}>{name}{RotationIcon}</p>
            </button>
            {floatingPortal(
                <div ref={mergedFloatingRef} style={floatingStyle} className={"focus:outline-0"}>
                    <EngineSetting onOpenChange={setOpen}/>
                </div>
            )}
        </>
    )
}

const HR = () => <hr className={"p-0 m-0 border my-1 w-full"}/>

const EngineSetting = ({onOpenChange}: { onOpenChange?: (o: boolean) => void }) => {
    const [value, setValue] = React.useState("")
    const {engineInUseId, setEngineInUseId} = useSignal(searchStore("engineInUseId"))
    const name = getEngineById(engineInUseId).name
    const {t} = useLanguage()

    // 处理排序逻辑
    const filteredAndSorted = React.useMemo(() => {
        // 如果输入为空或只有空白，直接返回原始顺序（浅拷贝，避免修改原数组）
        if (value.trim() === "") {
            return [...defaultEngines];
        }

        const lowerValue = value.toLowerCase();
        return defaultEngines
            .filter(engine => engine.name.toLowerCase().includes(lowerValue))
            .sort((a, b) => {
                const aIndex = a.name.toLowerCase().indexOf(lowerValue);
                const bIndex = b.name.toLowerCase().indexOf(lowerValue);
                if (aIndex !== bIndex) return aIndex - bIndex;
                return a.name.length - b.name.length;
            });
    }, [value]);

    const onSelect = (engine: SearchEngine) => {
        setEngineInUseId(engine.id);
        onOpenChange?.(false)
    };

    return (
        <div className={cn(
            "w-fit max-w-[216px] h-fit max-h-150",
            "rounded-md bg-background text-foreground",
            "flex flex-col items-start justify-start p-1"
        )}>
            <div className={"flex shrink-0 w-full flex-col items-start justify-start"}>
                <div className={"flex items-center justify-start mt-2"}>
                    <Search size={28} strokeWidth={3} className={"mx-2 mb-0.5 opacity-30"}/>
                    <input type={"text"} value={value} placeholder={t("search...")}
                           className={cn(RESET_INPUT, "leading-xl text-[17px] w-full")}
                           onInput={(e) => setValue(e.currentTarget.value)}></input>
                </div>
                <HR/>
            </div>
            <div className={"flex flex-col items-start justify-start w-full overflow-y-auto gap-1"}>
                {filteredAndSorted.length > 0
                    ? filteredAndSorted.map(engine =>
                        <button key={engine.id}
                                className={cn(BUTTON, ITEMS, "justify-between")}
                                onClick={() => onSelect(engine)}
                        >
                            {engine.name}
                            {engine.name === name && <Check/>}
                        </button>
                    )
                    : <p className={cn("h-full w-full text-xl px-2 py-1.5 flex items-center justify-start")}>
                        {t("No content found")}</p>
                }
            </div>
            <div className={"flex shrink-0 w-full flex-col items-start justify-start"}>
                <HR/>
                <button className={cn(BUTTON, ITEMS)}>{t("Custom")}</button>
            </div>
        </div>
    )
}

export const SearchBar2 = () => {
    const {visible, visibleHydrated} = useSignal(searchStore("visible"))
    return (
        <>
            {visibleHydrated && visible && <div className={WRAPPER}>
                <SearchIcon/>
                <SearchInput/>
                <EngineName/>
            </div>}
        </>
    )
}