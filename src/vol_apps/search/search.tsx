import {createSignal, useSignal} from "@/vol_apps/04_persist_atoms";
import {cn} from "@/lib/utils.ts";
import {Check, Search} from "lucide-react";
import React, {type KeyboardEventHandler, type ReactNode, useEffect, useLayoutEffect, useRef} from "react";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink.ts";
import {useFloating} from "@/vol_apps/02_hooks/float/useFloating.ts";
import {useKeyEscapeToClose} from "@/vol_apps/02_hooks/useKeys.ts";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/05_useClickOutsideToClose.ts";
import {useFocusOutsideToClose} from "@/vol_apps/02_hooks/06_useFocusOutsideToClose.ts";
import {useMergeRefs} from "@/vol_apps/02_hooks/01_useMergeRefs.ts";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {useModalPortal} from "@/vol_apps/02_hooks/float/useModalPortal.tsx";

import {Button} from "@/components/ui/button.tsx";

import {defaultEngines, type SearchEngine, searchStore, useSearchStore} from "@/vol_apps/search/searchSignal.ts";

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
const NAME_BOX = cn(BOX_FLEX, BOX_HEIGHT, "text-[19px] font-semibold select-none")

// input
const RESET_TEXTAREA = "block w-full resize-none overflow-hidden border-0 p-0 m-0 bg-transparent outline-none"
const TEXTAREA = cn("px-1 py-[8px] text-[22px] group-hover:bg-white focus:text-black text-sBlue",
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
    if (hasIcon) return (
        <div className={ICON_BOX}>
            <div className={"relative w-[30px] h-[30px]"}>
                <img src={engine?.icon} alt="icon"
                     className="absolute w-[30px] h-[30px] select-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                />
            </div>
        </div>
    )
    return (
        <div className={ICON_BOX}>
            <Search strokeWidth={3} size={30}/>
        </div>
    )
}

const SearchIcon = () => {
    const {getCurrentEngine} = useSearchStore()
    const engine = getCurrentEngine()
    const onClick = () => {
        if (engine) openLinkInNewTab(engine.homepageUrl)
    }

    return (
        <button className={cn(BUTTON, ICON_WRAPPER)} onClick={onClick}>
            <CurrentIcon/>
        </button>
    )
}


// BetterTextarea: a controlled textarea component
// 1. default styles are removed
// 2. rows resized by `value` prop
// 3. blur on Escape press
// const RESET_TEXTAREA = "block w-full resize-none overflow-hidden border-0 p-0 m-0 bg-transparent outline-none"

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

    useLayoutEffect(() => {
        // resize rows
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;

    }, [value]);

    return (
        <>
            <textarea
                ref={ref}
                placeholder={placeholder}
                className={cn(RESET_TEXTAREA, className)}
                disabled={disabled}
                // readOnly={disabled}
                rows={1}
                // onInput={resize}
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

const RotationIcon = ({open}: { open: boolean }) =>
    <span className={"inline-block text-[16px] translate-y-px translate-x-1 select-none"} style={{
        opacity: 0.5,
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: `transform ${open ? duration : exitDuration}ms ease-in-out`,
    }}>▼</span>

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


    return (
        <>
            <button ref={mergedAnchorRef} className={cn(BUTTON, NAME_WRAPPER)} onClick={onClick}>
                <p className={NAME_BOX}>{name}<RotationIcon open={open}/></p>
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

    // 自动定位视口到 current engine
    useEffect(() => {
        if (!mounted) return;
        const el = document.querySelector(`[data-engine-id="${engineInUseId}"]`);
        if (!el) return;
        el.scrollIntoView({block: "nearest"});
    }, [mounted, engineInUseId]);

    return (
        <div className={cn(
            "w-fit max-w-[250px] h-fit max-h-125",
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
            <div className={"flex flex-col items-start justify-start w-full overflow-y-auto gap-1 select-none"}>
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
    const timeRef = useRef<number | null>(null);
    useEffect(() => {
        return () => {
            if (timeRef.current) clearTimeout(timeRef.current);
        };
    }, []);
    const { t } = useLanguage();
    const onClick = () => {
        selectIsOpenSiganle.set(false);
        if (timeRef.current) clearTimeout(timeRef.current);
        timeRef.current = setTimeout(() => customIsOpenSignal.set(true), exitDuration);
    }
    return <button className={cn(BUTTON, ITEMS)} onClick={onClick}>{t("Custom")}</button>;
};

const InsertEngineButton = () => {
    const {t} = useLanguage()
    const {creatNewengine, setEngineInUseId} = useSearchStore()
    const onClick = () => {
        const newId = creatNewengine()
        setEngineInUseId(newId)
    }
    return <Button variant={"outline"} className={"w-full h-10"} onClick={onClick}>{t("New Custom")}</Button>
}

const FIELDS = [
    "name",
    "queryStringPrefix",
    "homepageUrl",
    "icon",
] as const;

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

    // const FIELD_LABELS: Record<Exclude<keyof SearchEngine, "id">, string> = {
    const FIELD_LABELS = {
        name: t("Name"),
        queryStringPrefix: t("Search URL Prefix"),
        homepageUrl: t("Homepage URL"),
        icon: t("Icon"),
    } as const;

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
                                                <BetterTextarea className={cn(FIELD_CONTENT, !disabled && "border bg-white text-black")}
                                                    // placeholder="\u200b"
                                                                disabled={disabled}
                                                                value={value}
                                                                onValueChange={onValueChange}/>
                                            </div>
                                        )
                                    })
                            }

                            {canBeRemoved &&
                                <div className={FIELD_GROUP}>
                                    <div className={FIELD_NAME}>{t("Delete")}</div>
                                    <button className={cn(FIELD_CONTENT, "border",
                                        "text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                                    )}
                                            onClick={() => deleteEngineById(engineInUseId)}
                                    >{t("delete this search engine")}</button>
                                </div>
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

export const SearchBar = () => {
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