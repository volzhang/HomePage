import {
    type ButtonHTMLAttributes, createContext,
    forwardRef, useContext,
    type ReactNode, useState, cloneElement, useCallback, useMemo, type CSSProperties,
} from "react";
import {cn} from "@/lib/utils";
import {CheckIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useFloating} from "@/vol_apps/02_hooks/useFloating";
import {useKeyEscapeToClose} from "@/vol_apps/02_hooks/useKeys";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/useClickOutsideToClose";
import {useFocusOutsideToClose} from "@/vol_apps/02_hooks/useFocusOutsideToClose";
import {useMergeRefsLoose} from "@/vol_apps/02_hooks/01_useMergeRefs";

export const MENU_CLASS = cn(
    "flex flex-col items-center border w-[136px]",
    "bg-background text-foreground",
    "rounded-md shadow-md",
    "select-none",
    "p-1"
);

export const ITEM_CLASS = cn(
    "flex items-center justify-between w-full",
    "h-8 bg-background text-foreground",
    "text-sm rounded-sm",
    "hover:bg-foreground/10",
    "whitespace-nowrap",
    "select-none",
    "p-2"
);

export const TRIGGER_CLASS = cn(
    "w-[136px] flex items-center justify-between"
)

export const SelectContext = createContext<{
    value?: string;
    onValueChange?: (value: string) => void;

    open: boolean;
    onOpenChange?: (open: boolean) => void;

    // hook 传参
    anchorRef?: React.Ref<any>;
    floatingStyle?: CSSProperties;

}>({open: false});

export const useSelectContext = () => useContext(SelectContext);

interface UListProps {
    children?: ReactNode;
    options?: { label: ReactNode; value: string }[];
    menuClassName?: string;
    itemClassName?: string;
    checkIconClassName?: string;
    className?: string;   // 仅用于便捷追加类名，会与 MENU_CLASS 合并
}

export const Content = forwardRef<HTMLUListElement, UListProps>(({
                                                                     children,
                                                                     options,
                                                                     menuClassName,
                                                                     itemClassName,
                                                                     checkIconClassName,
                                                                 }, ref) => {
    const {open, onOpenChange, floatingStyle} = useSelectContext();

    const onClose = useCallback(() => onOpenChange?.(false), [onOpenChange]);

    useKeyEscapeToClose(open, onClose);
    const {clickOutsideRef} = useClickOutsideToClose({open, onClose});
    const {focusOutsideRef} = useFocusOutsideToClose({open, onClose});

    const mergedRef = useMergeRefsLoose(ref, clickOutsideRef, focusOutsideRef);

    return (
        <ul
            ref={mergedRef}
            className={cn(MENU_CLASS, menuClassName)}
            style={floatingStyle}
        >
            {children
                ? children
                : options?.map(opt => (
                    <Option
                        key={opt.value}
                        value={opt.value}
                        itemClassName={itemClassName}
                        checkIconClassName={checkIconClassName}
                    >
                        {opt.label}
                    </Option>
                ))
            }
        </ul>
    );
});

interface OptionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
    value: string;
    children: ReactNode;
    itemClassName?: string;
    checkIconClassName?: string;
}

export const Option = ({
                           value,
                           children,
                           itemClassName,
                           checkIconClassName,
                           onClick,
                           ...buttonProps
                       }: OptionProps) => {
    const {value: selectedValue, onValueChange, onOpenChange} = useSelectContext();
    const isSelected = selectedValue === value;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onOpenChange?.(false);
        onValueChange?.(value);
        onClick?.(e)
    };

    return (
        <li className="w-full" role="option" aria-selected={isSelected}>
            <button
                className={cn(ITEM_CLASS, itemClassName)}
                onClick={handleClick} {...buttonProps}>
                {children}
                {isSelected && <CheckIcon className={cn("size-4", checkIconClassName)}/>}
            </button>
        </li>
    );
};

interface TriggerProps {
    children: React.ReactElement<any>;
    triggerClassName?: string;
}

export const Trigger = ({children, triggerClassName, ...rest}: TriggerProps) => {
    const child = children;

    const { open, onOpenChange, anchorRef } = useSelectContext();
    // const originalRef = (child as any).ref;
    const originalRef = getElementRef(child);
    const mergedRef = useMergeRefsLoose(anchorRef, originalRef);

    return cloneElement(child, {
        ref: mergedRef,
        className: cn(TRIGGER_CLASS, triggerClassName, child.props.className),
        onClick: (e: React.MouseEvent) => {
            child.props.onClick?.(e);
            if (!e.defaultPrevented) {
                onOpenChange?.(!open);
            }
        },
        role: "combobox",
        "aria-expanded": open,
        "aria-haspopup": "listbox",
        ...rest,
    });
};

interface SelectProps {
    value?: string;
    onValueChange?: (value: string) => void;

    open: boolean;
    onOpenChange: (open: boolean) => void;

    children: ReactNode;

    direction?: "bottom" | "top" | "left" | "right";
    align?: "start" | "center" | "end";
    offset?: number;
    duration?: number;
    exitDuration?: number;
}

export const SelectComponent = ({
                                    value,
                                    onValueChange,
                                    open,
                                    onOpenChange,
                                    children,

                                    direction = "bottom",
                                    align = "start" ,
                                    offset = 4,
                                    duration = 200,
                                    exitDuration = 0,
                                }: SelectProps) => {
    // 定位与动画
    const {anchorRef, floatingStyle} = useFloating({
        open,
        direction,
        align,
        offset,
        duration,
        exitDuration,
    });

    const contextValue = useMemo(() => ({
        value,
        onValueChange,
        open,
        onOpenChange,

        anchorRef,
        floatingStyle,

    }), [value, onValueChange, open, onOpenChange,
        anchorRef, floatingStyle]);

    return (
        <SelectContext.Provider value={contextValue}>
            {children}
        </SelectContext.Provider>
    );
};

export const DemoSelect = () => {
    const [lang, setLang] = useState("en");
    const [open, setOpen] = useState(false);

    return (
        <SelectComponent
            value={lang}
            onValueChange={(val) => setLang(val)}
            open={open}
            onOpenChange={setOpen}
        >
            <Trigger>
                <Button variant="outline">
                    {lang}
                </Button>
            </Trigger>

            <Content>
                <Option value="en">English</Option>
                <Option value="cn">简体中文</Option>
            </Content>
        </SelectComponent>
    );
};


/**
 * 从 ReactElement 实例上提取其 ref。
 * 注意：React 运行时 ref 始终会挂载在元素对象上（不在 props 中），
 * 但最新 @types/react 的类型里已将其移除，故内部通过 any 断言。
 */
function getElementRef(element: React.ReactElement): React.Ref<any> | undefined {
    return (element as any).ref;
}


