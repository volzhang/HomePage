import {createSignal, initStoreState, useSignal} from "@/vol_apps/04_persist_atoms";
import {cn} from "@/lib/utils.ts";
import {Check, Search} from "lucide-react";
import React, {type KeyboardEventHandler, type ReactNode, useEffect, useMemo} from "react";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink.ts";
import {useFloating} from "@/vol_apps/02_hooks/float/useFloating.ts";
import {useKeyEscapeToClose} from "@/vol_apps/02_hooks/useKeys.ts";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/05_useClickOutsideToClose.ts";
import {useFocusOutsideToClose} from "@/vol_apps/02_hooks/06_useFocusOutsideToClose.ts";
import {useMergeRefs} from "@/vol_apps/02_hooks/01_useMergeRefs.ts";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {useModalPortal} from "@/vol_apps/02_hooks/float/useModalPortal.tsx";
import {timeout} from "@dnd-kit/dom/utilities";
import {toast} from "sonner";
import {Button} from "@/components/ui/button.tsx";

import search_bing from "@/assets/search_bing.svg";
import search_google from "@/assets/search_google.png";
import search_duckduckgo from "@/assets/search_duckduckgo.svg";
import search_yandex from "@/assets/search_yandex.png";
import search_baidu from "@/assets/search_baidu.png";
import search_yahoo from "@/assets/search_yahoo.png";
import search_brave from "@/assets/search_brave.svg";
import search_ecosia from "@/assets/search_ecosia.svg";

type SearchEngine = {
    id: number;
    queryStringPrefix: string;      // search engine queryStringPrefix, for example, https://www.bing.com/search?q=
    homepageUrl: string;        // search engine homepage url, for example, https://www.bing.com/
    name: string;
    icon: string;       //base64 string(img type), default ""
};

const defaultEngines: SearchEngine[] = [
    {id: 0, name: "Bing", queryStringPrefix: "https://www.bing.com/search?q=", homepageUrl: "https://www.bing.com/", icon: search_bing},
    {id: 1, name: "Google", queryStringPrefix: "https://www.google.com/search?q=", homepageUrl: "https://www.google.com/", icon: search_google},
    {id: 3, name: "Yandex", queryStringPrefix: "https://yandex.com/search?text=", homepageUrl: "https://yandex.com/", icon: search_yandex},
    {id: 5, name: "Yahoo!", queryStringPrefix: "https://search.yahoo.com/search?p=", homepageUrl: "https://search.yahoo.com/", icon: search_yahoo},
    {id: 2, name: "DuckDuckGo", queryStringPrefix: "https://duckduckgo.com/?q=", homepageUrl: "https://duckduckgo.com/", icon: search_duckduckgo},
    {id: 6, name: "Brave", queryStringPrefix: "https://search.brave.com/search?q=", homepageUrl: "https://search.brave.com/", icon: search_brave},
    {id: 7, name: "Ecosia", queryStringPrefix: "https://www.ecosia.org/search?q=", homepageUrl: "https://www.ecosia.org/", icon: search_ecosia},
    {id: 4, name: "Baidu", queryStringPrefix: "https://www.baidu.com/s?wd=", homepageUrl: "https://www.baidu.com/", icon: search_baidu},
]

export const searchStore = initStoreState({
    storeName: "search",
    fields: {
        engineInUseId: 0,
        customEngines: [] as SearchEngine[],
        visible: true,
    }
})

const useSearchStore = () => {
    const {engineInUseId, setEngineInUseId} = useSignal(searchStore("engineInUseId"))
    const {customEngines, setCustomEngines} = useSignal(searchStore("customEngines"))

    const getEngines = (): SearchEngine[] => {
        const engines: SearchEngine[] = []
        defaultEngines.forEach(engine => {
            engines.push(engine)
        })
        customEngines.forEach(engine => {
            engines.push(engine)
        })
        return engines;
    }

    const getEngineById = (id: number): SearchEngine | null => {
        const custom = customEngines.find(e => e.id === id);
        if (custom) return custom;
        const def = defaultEngines.find(e => e.id === id);
        if (def) return def;
        console.error("no engine found", id, "fallback to bing");
        return null
    }

    const getCurrentEngine = (): SearchEngine | null => {
        return getEngineById(engineInUseId)
    }

    const getCurrentEngineName = (): string => {
        const engine = getCurrentEngine()
        if (engine) return engine.name
        return t("unknown")
    }

    const generateNewEngineId = (): number => {
        const usedIds = new Set<number>();
        defaultEngines.forEach(e => usedIds.add(e.id));
        customEngines.forEach(e => usedIds.add(e.id));
        return Math.max(...usedIds) + 1;
    };

    // 只能修改自定义引擎
    const updateEngineById = (id: number, updates: Partial<SearchEngine>): void => {
        if (Object.keys(updates).length === 0) return;

        // 只能修改自定义引擎
        const baseEngine = customEngines.find(e => e.id === id);
        if (!baseEngine) return

        const updatedEngine = {...baseEngine, ...updates};

        const existingIndex = customEngines.findIndex(e => e.id === id);
        let newEngines: SearchEngine[];
        if (existingIndex !== -1) {
            newEngines = [...customEngines];
            newEngines[existingIndex] = updatedEngine;
        } else {
            newEngines = [...customEngines, updatedEngine];
        }
        setCustomEngines(newEngines)
    }

    const {t} = useLanguage()
    const creatNewengine = (): number => {
        const newId = generateNewEngineId();
        const n = newId - defaultEngines.length

        const newEngine: SearchEngine = {
            id: newId,
            name: `${t("Custom Search")} ${n === 0 ? "" : n}`,
            queryStringPrefix: "",
            homepageUrl: "",
            icon: "",
        };
        setCustomEngines([...customEngines, newEngine]);
        setEngineInUseId(newId)
        return newId;
    }

    const deleteEngineById = (id: number): void => {
        // 只能删除自定义引擎
        const baseEngine = customEngines.find(e => e.id === id);
        if (!baseEngine) return;

        const newEngines = customEngines.filter(e => e.id !== id);
        setCustomEngines(newEngines);

        if (engineInUseId === id) {
            toast.info("fallback to bing");
            setEngineInUseId(0);
        }
    }

    return {
        engineInUseId, setEngineInUseId,
        customEngines, setCustomEngines,
        getEngines,
        getCurrentEngine,
        getCurrentEngineName,
        getEngineById,
        generateNewEngineId,
        updateEngineById,
        creatNewengine,
        deleteEngineById,
    }
}

const selectIsOpenSiganle = createSignal<boolean>(false)
const customIsOpenSignal = createSignal<boolean>(false)

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
const BOX_FLEX = "flex items-center whitespace-nowrap"

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

const CurrentIcon = () => {
    const {getCurrentEngine} = useSearchStore()
    const engine = getCurrentEngine()
    const hasIcon = engine?.icon !== ""

    return (
        <div className={ICON_BOX}>
            {hasIcon
                ?
                <div className={"relative w-[32px] h-[32px]"}>
                    <img
                        className="absolute max-w-none select-none"
                        style={{
                            width: `${32}px`,
                            height: `${32}px`,
                            left: "50%",
                            top: "50%",
                            transform: `translate(calc(-50% + ${0}px), calc(-50% + ${0}px))`,
                        }}
                        src={engine?.icon}
                        alt="icon"
                    />
                </div>
                :
                <Search strokeWidth={3} size={30}/>}
        </div>
    )
}

const SearchIcon = () => {
    const {getCurrentEngine} = useSearchStore()
    const engine = getCurrentEngine()
    const onClick = () => {
        if (!engine) return
        openLinkInNewTab(engine.homepageUrl)
    }

    return (
        <button className={cn(BUTTON, ICON_WRAPPER)} onClick={onClick}>
            <CurrentIcon/>
        </button>
    )
}

const BetterTextarea = ({
                            value,
                            onValueChange,
                            onKeyDown,
                            className,
                            disabled,
                            placeholder
                        }: {
    value?: string,
    disabled?: boolean
    onValueChange?: (v: string) => void
    onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>,
    className?: string
    placeholder?: string
}) => {
    const ref = React.useRef<HTMLTextAreaElement>(null);

    const resize = () => {
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => {
        resize();
    }, [value]);

    return (
        <>
            <textarea
                ref={ref}
                placeholder={placeholder}
                className={className}
                disabled={disabled}
                readOnly={disabled}
                rows={1}
                onInput={resize}
                onKeyDown={(e) => {
                    if (e.key === "Escape") {
                        e.preventDefault()
                        e.currentTarget.blur()
                    }
                    onKeyDown?.(e)
                }}
                value={value}
                onChange={(e) => onValueChange?.(e.currentTarget.value)}
            />
        </>
    )
}

const SearchInput = () => {
    const {getCurrentEngine} = useSearchStore()
    const engine = getCurrentEngine()
    const [value, setValue] = React.useState("")

    const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key === "Enter") {
            if (e.shiftKey) return;     // Shift + Enter 什么都不用做，让 textarea 默认插入换行
            e.preventDefault()
            const keyword = e.currentTarget.value
            const prefix = engine?.queryStringPrefix
            const url = prefix + encodeURIComponent(keyword)
            openLinkInNewTab(url)
            return;
        }
    }

    return <BetterTextarea
        value={value}
        onValueChange={setValue}
        className={TEXTAREA}
        onKeyDown={onKeyDown}
    />
}

const duration = 250
const exitDuration = 250
const scale = 90
const zIndex = 30
const RESET_INPUT = "m-0 p-0 outline-0"
const ITEMS = cn("text-xl w-full px-2 py-1.5 h-fit rounded-[5px]")

const EngineName = () => {

    const open = selectIsOpenSiganle.use()
    const onClose = () => selectIsOpenSiganle.set(false)
    const onClick = () => selectIsOpenSiganle.set(!open)

    const {anchorRef, floatingRef, floatingStyle, floatingPortal, portalMounted} = useFloating({
        open, duration, exitDuration, scale, zIndex,
        direction: 'bottom', align: 'end', offset: 8,
    });

    // 关闭行为
    useKeyEscapeToClose(open, onClose);
    const {clickOutsideRef, clickOutsideIgnoreRef} = useClickOutsideToClose({open, onClose});
    const {focusOutsideRef, focusOutsideIgnoreRef} = useFocusOutsideToClose({open: portalMounted, onClose});
    //useFocusOutsideToClose 需要注意，延迟显示的dom需要使用正确的open判断

    const mergedAnchorRef = useMergeRefs(anchorRef, clickOutsideIgnoreRef, focusOutsideIgnoreRef);
    const mergedFloatingRef = useMergeRefs(floatingRef, clickOutsideRef, focusOutsideRef);

    const {getCurrentEngineName} = useSearchStore()
    const name = getCurrentEngineName()

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
            {/* floatingPortal需要和按钮锚定位置，不拆分 */}
            {floatingPortal(
                <div ref={mergedFloatingRef} style={floatingStyle} className={"focus:outline-0"}>
                    <SelectEngine mounted={portalMounted}>
                        <>
                            <HR/>
                            <CustomEngineButton/>
                        </>
                    </SelectEngine>
                </div>
            )}
        </>
    )
}

const HR = () => <hr className={"p-0 m-0 border my-1 w-full"}/>
const LINE = () => <div className={"border flex w-px my-1"}></div>

const SelectEngine = ({
                          mounted,
                          children
                      }: {
    mounted: boolean,
    children?: ReactNode
}) => {

    const onOpenChange = (o: boolean) => selectIsOpenSiganle.set(o)
    const [value, setValue] = React.useState("")

    const {engineInUseId, setEngineInUseId, getEngines} = useSearchStore()
    const engines = getEngines()

    const {t} = useLanguage()

    // 处理排序逻辑
    const filteredAndSorted = React.useMemo(() => {
        // 如果输入为空或只有空白，直接返回原始顺序
        if (value.trim() === "") return [...engines];
        const lowerValue = value.toLowerCase();
        return engines
            .filter(engine => engine.name.toLowerCase().includes(lowerValue))
            .sort((a, b) => {
                const aIndex = a.name.toLowerCase().indexOf(lowerValue);
                const bIndex = b.name.toLowerCase().indexOf(lowerValue);
                if (aIndex !== bIndex) return aIndex - bIndex;
                return a.name.length - b.name.length;
            });

    }, [value, engines]);

    const onSelect = (engine: SearchEngine) => {
        setEngineInUseId(engine.id);
        onOpenChange(false)
    };

    useEffect(() => {
        if (!mounted) return;
        const el = document.querySelector(`[data-engine-id="${engineInUseId}"]`);
        if (!el) return;
        el.scrollIntoView({block: "nearest"});
    }, [mounted, engineInUseId]);

    return (
        <div className={cn(
            "w-fit max-w-[250px] h-fit max-h-124",
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
                                data-engine-id={engine.id}
                                className={cn(BUTTON, ITEMS, "justify-between whitespace-nowrap")}
                                onClick={() => onSelect(engine)}
                        >
                            {engine.name === "" ? "\u200b" : engine.name}
                            {engine.id === engineInUseId && <Check/>}
                        </button>
                    )
                    : <p className={cn("h-full w-full text-xl px-2 py-1.5 flex items-center justify-start")}>
                        {t("No content found")}</p>
                }
            </div>
            <div className={"flex shrink-0 w-full flex-col items-start justify-start"}>
                {children}
            </div>
        </div>
    )
}

const CustomEngineButton = () => {
    const {t} = useLanguage()
    const onClick = () => {
        selectIsOpenSiganle.set(false)
        timeout(() => customIsOpenSignal.set(true), exitDuration)
    }
    return <button className={cn(BUTTON, ITEMS)} onClick={onClick}>{t("Custom")}</button>
}

const InsertEngineButton = () => {
    const {t} = useLanguage()
    const {creatNewengine, setEngineInUseId} = useSearchStore()
    const onClick = () => {
        const newId = creatNewengine()
        setEngineInUseId(newId)
    }
    return <Button variant={"outline"} className={"w-full h-10"} onClick={onClick}>{t("New Custom")}</Button>
}

const FIELDS: Array<Exclude<keyof SearchEngine, "id">> = [
    "name",
    "queryStringPrefix",
    "homepageUrl",
    "icon",
];

// const FIELD_LABELS: Record<Exclude<keyof SearchEngine, "id">, string> = {
//     name: "Name",
//     queryStringPrefix: "QueryPrefix URL",
//     homepageUrl: "Homepage URL",
//     icon: "Icon",
// };

// const ITEMS = cn("text-xl w-full px-2 py-1.5 h-fit rounded-[5px]")

const FIELD_GROUP = "flex flex-row h-fit items-center justify-start mt-2"
const FIELD_NAME = "w-48 h-fit text-xl px-2 py-1.5 rounded-[5px] flex items-center justify-start text-foreground/50"
const FIELD_CONTENT = "flex flex-1 text-xl px-2 py-1.5 rounded-[5px] items-center justify-start"

const CustomEnginePortal = () => {

    const open = customIsOpenSignal.use()
    const onOpenChange = (o: boolean) => customIsOpenSignal.set(o)
    const {modalPortal, portalMounted} = useModalPortal({open, onOpenChange, duration, exitDuration, scale, zIndex});
    const {engineInUseId, updateEngineById, deleteEngineById, getCurrentEngine} = useSearchStore()

    const currentEngine = getCurrentEngine()

    const {t} = useLanguage()

    const canBeRemoved: boolean = currentEngine !== null && currentEngine.id >= defaultEngines.length

    const handleIconClick = async () => {
        try {
            // @ts-ignore
            const [fileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: "Images",
                        accept: {
                            "image/png": [".png"],
                            "image/jpeg": [".jpg", ".jpeg"],
                            "image/webp": [".webp"],
                            "image/svg+xml": [".svg"],
                            "image/bmp": [".bmp"],
                            "image/x-icon": [".ico"],
                        },
                    },
                ],
                multiple: false,
                excludeAcceptAllOption: true,
            });
            const file = await fileHandle.getFile();
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                updateEngineById(engineInUseId, {icon: base64});
            };
            reader.readAsDataURL(file);
        } catch (error) {
            // 取消或失败
        }
    }

    const FIELD_LABELS: Record<Exclude<keyof SearchEngine, "id">, string> = {
        name: t("Name"),
        queryStringPrefix: t("Search URL Prefix"),
        homepageUrl: t("Homepage URL"),
        icon: t("Icon"),
    };

    return (
        <>
            {modalPortal(
                <div className={"h-140 w-fit flex flex-row bg-background text-foreground gap-1 rounded-md overflow-hidden"}>
                    <div className={"relative flex flex-col"}>
                        <SelectEngine mounted={portalMounted}/>
                        <div className={"absolute bottom-2 left-2 right-1"}>
                            {/*<HR/>*/}
                            <InsertEngineButton/>
                        </div>
                    </div>
                    <LINE/>
                    <div className={cn("relative flex flex-col w-150 mb-3 ml-1 mr-3 gap-6 h-140 pt-3")}>
                        <div className={"flex flex-col w-full h-fit max-h-115 overflow-y-auto "}>
                            {
                                currentEngine === null
                                    ? <>loading</>
                                    : FIELDS.map(key => {
                                        const value = currentEngine[key] || "";
                                        const disabled = defaultEngines.some(e => e.id === currentEngine.id)
                                        const onValueChange = (v: string) => updateEngineById(engineInUseId, {[key]: v})

                                        if (key === "icon") return (
                                            disabled ? null :
                                                <div key={key} className={FIELD_GROUP}>
                                                    <div className={cn(FIELD_NAME, "w-35")}>{FIELD_LABELS[key]}</div>
                                                    <div className={cn(FIELD_NAME, "w-13 h-[44px]")}>
                                                        <CurrentIcon/>
                                                    </div>
                                                    <button className={cn(FIELD_CONTENT, "border text-sBlue",
                                                        "hover:bg-sBlue hover:text-white", "cursor-pointer"
                                                    )} onClick={handleIconClick}
                                                    >{t("custom icon")}</button>
                                                </div>
                                        )

                                        return (
                                            <div key={key} className={FIELD_GROUP}>
                                                <div className={FIELD_NAME}>{FIELD_LABELS[key]}</div>
                                                <BetterTextarea className={cn(RESET_TEXTAREA, FIELD_CONTENT, !disabled && "border bg-white text-black")}
                                                    // placeholder="\u200b"
                                                                disabled={disabled}
                                                                value={value}
                                                                onValueChange={onValueChange}/>
                                            </div>
                                        )
                                    })
                            }

                            {canBeRemoved &&
                                <>
                                    <div>
                                        <div className={FIELD_GROUP}>
                                            <div className={FIELD_NAME}>{t("Delete")}</div>
                                            <button className={cn(FIELD_CONTENT, "border",
                                                "text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                                            )}
                                                    onClick={() => deleteEngineById(engineInUseId)}
                                            >{t("delete this search engine")}</button>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                        <Button className={"absolute bottom-2 left-0 right-0 h-10"}
                                variant={"outline"} onClick={() => onOpenChange(false)}>{t("OK")}</Button>
                    </div>
                </div>
            )}
        </>
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
                <CustomEnginePortal/>
            </div>}
        </>
    )
}