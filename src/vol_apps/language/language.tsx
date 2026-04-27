// components/SelectDemo.tsx
import React from "react";
import * as Select from "@radix-ui/react-select";
import {CheckIcon, Languages} from "lucide-react";
import {cn} from "@/lib/utils";
import {RotateOnOpen} from "@/vol_apps/01_components/RotateOnOpen";
import {useLanguageStore} from "@/vol_apps/language/language_store";

const CLASS_Trigger = cn(
    "flex items-center justify-between",
    "w-34 h-9 px-3",
    "text-foreground bg-background",
    "rounded-md border shadow-xs text-sm",
    "outline-none select-none",
    "hover:bg-accent hover:text-accent-foreground",
    "dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
)

const MENU_CLASS = cn(
    "border bg-background text-popover-foreground rounded-md shadow-md",
    "z-1"
);

const ITEM_CLASS = cn(
    "flex items-center justify-between",
    "px-2 h-8 w-32 bg-background",
    "text-sm rounded-sm",
    "whitespace-nowrap",
    "select-none"
);

// ---------- SelectItem 封装 ----------
interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof Select.Item> {
    children: React.ReactNode;
    className?: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
    ({children, className, ...props}, forwardedRef) => {
        return (
            <Select.Item
                className={cn(
                    // 基础列表项样式
                    ITEM_CLASS,
                    "leading-none",
                    "data-disabled:pointer-events-none ",
                    "data-disabled:opacity-50",
                    "data-highlighted:bg-foreground/5 ",
                    "data-highlighted:text-foreground ",
                    "data-highlighted:outline-none",
                    className,
                )}
                {...props}
                ref={forwardedRef}
            >
                <Select.ItemText>{children}</Select.ItemText>
                <Select.ItemIndicator>
                    <CheckIcon className="size-4"/>
                </Select.ItemIndicator>
            </Select.Item>
        );
    },
);


// ---------- 组件主体 ----------
export const Language = () => {
    const {t} = useLanguageStore()
    const [open, setOpen] = React.useState(false);
    return (
        <>
            <Select.Root open={open} onOpenChange={setOpen}>
                {/* 触发器 */}
                <Select.Trigger
                    onClick={() => setOpen(!open)}
                    className={cn(CLASS_Trigger, "")}
                    aria-label={t("language")}
                    defaultValue={"en"}
                >

                    <Languages className={"justify-start size-4 text-foreground"}/>
                    <Select.Value placeholder={t("Select Language")}/>
                    <RotateOnOpen open={open} className={"text-sm"}/>

                </Select.Trigger>
                {/* 弹出层 */}
                <Select.Portal>
                    {/*<Floating open={open} direction={"bottom"}>*/}
                    <Select.Content position={"popper"} side={"bottom"} sideOffset={4}
                                    className={cn(
                                        MENU_CLASS,
                                        // 弹出动画
                                        "will-change-all",
                                        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                                        "data-[side=top]:slide-in-from-bottom-5",
                                        "data-[side=bottom]:slide-in-from-top-5",
                                        "data-[side=right]:slide-in-from-left-5",
                                        "data-[side=left]:slide-in-from-right-5",
                                    )}
                    >
                        {/* 视口 */}
                        <Select.Viewport className="p-[5px]">
                            <Select.Group>
                                <SelectItem value={"en"}>English</SelectItem>
                                <SelectItem value={"cn"}>简体中文</SelectItem>
                            </Select.Group>
                        </Select.Viewport>
                    </Select.Content>
                    {/*</Floating>*/}
                </Select.Portal>
            </Select.Root>
        </>
    )
}