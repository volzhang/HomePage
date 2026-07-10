import React, {
    type ButtonHTMLAttributes, type ReactNode, type CSSProperties,
    createContext, useContext, useState, cloneElement, useCallback, useMemo, Children, isValidElement,
    type ReactElement, type Ref, type ReactPortal, startTransition,
} from "react";
import {cn} from "@/lib/utils";
import {CheckIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useFloating} from "../02_hooks/float/useFloating";
import {useKeyEscapeToClose} from "@/vol_apps/02_hooks/useKeys";
import {useClickOutsideToClose} from "../02_hooks/05_useClickOutsideToClose";
import {useFocusOutsideToClose} from "../02_hooks/06_useFocusOutsideToClose";
import {useMergeRefsLoose} from "@/vol_apps/02_hooks/01_useMergeRefs";
import {useDelayed} from "@/vol_apps/02_hooks/02_useDelayed.ts";
import {useKeyboardNavigation} from "@/vol_apps/02_hooks/07_useKeyboardNavigation.ts";

export const MENU_CLASS = cn(
    "flex flex-col border items-center",
    "bg-popover text-foreground",
    "rounded-md shadow-md",
    "select-none",
    "p-1",
);

export const ITEM_CLASS = cn(
    "flex items-center justify-between w-full",
    "h-8 text-foreground",
    "text-sm rounded-sm",
    "bg-popover hover:bg-foreground/10",
    "focus:outline-none focus:bg-foreground/10",
    "whitespace-nowrap",
    "select-none",
    "p-2"
);

export const TRIGGER_CLASS = ""

export const SelectContext = createContext<{
    value?: string;
    onValueChange?: (value: string) => void;

    open: boolean;
    onOpenChange?: (open: boolean) => void;

    anchorRef?: Ref<any>;
    floatingRef?: Ref<any>;
    floatingStyle?: CSSProperties;
    floatingPortal?: (node: ReactNode) => ReactPortal | null;

    itemRef?: (index: number) => (node: HTMLElement | null) => void;

    duration?: number;
    exitDuration?: number;

}>({open: false});

export const useSelectContext = () => useContext(SelectContext);

interface ContentProps {
    children?:
        | ReactElement<OptionProps>
        | ReactElement<OptionProps>[];
    options?: { label: ReactNode; value: string }[];
    menuClassName?: string;
    itemClassName?: string;
    checkIconClassName?: string;
    className?: string;

    ref?: React.Ref<HTMLUListElement>;
}


export const Content = ({
                            children,
                            options,
                            ref,
                            menuClassName, itemClassName, checkIconClassName
                        }: ContentProps) => {
    const {
        open, onOpenChange,
        floatingStyle, floatingPortal, floatingRef,
        itemRef,
    } = useSelectContext();

    const onClose = useCallback(() => onOpenChange?.(false), [onOpenChange]);
    useKeyEscapeToClose(open, onClose);
    const mergedRef = useMergeRefsLoose(ref, floatingRef);

    // 将 children 统一为数组
    const optionElements = useMemo(
        () => (children ? Children.toArray(children) : []),
        [children]
    );

    const processedChildren = useMemo(
        () =>
            optionElements.map((child, index) => {
                if (isValidElement(child) && child.type === Option) {
                    return cloneElement(child, {
                        ref: itemRef?.(index),
                    } as any);
                }
                return child;
            }),
        [optionElements, itemRef]
    );

    return (
        floatingPortal?.(
            <ul
                ref={mergedRef}
                className={cn(MENU_CLASS, menuClassName,)}
                style={floatingStyle}
            >
                {
                    children
                        ? processedChildren
                        : options?.map((opt, index) => (
                            <Option
                                ref={itemRef?.(index)}
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
        )
    );
}

interface OptionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
    value?: string;
    children: ReactNode;
    itemClassName?: string;
    checkIconClassName?: string;

    ref?: React.Ref<HTMLButtonElement>;
}

export const Option = ({
                           value,
                           children,
                           ref,
                           itemClassName, checkIconClassName,
                           onClick,
                           ...buttonProps
                       }: OptionProps) => {
    const {value: selectedValue, onValueChange, onOpenChange, exitDuration} = useSelectContext();
    const isSelected = value
        ? selectedValue === value
        : false

    const Clickhandler = useDelayed<React.MouseEvent<HTMLButtonElement>>((e) => {
        startTransition(() => {
            if (value) onValueChange?.(value)
            onClick?.(e)
        })
    }, exitDuration);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onOpenChange?.(false);
        Clickhandler(e)
    };

    return (
        <li className="w-full" role="option" aria-selected={isSelected}>
            <button
                ref={ref}
                className={cn(ITEM_CLASS, itemClassName)}
                onClick={handleClick} {...buttonProps}>
                {children}
                {isSelected && <CheckIcon className={cn("size-4", checkIconClassName)}/>}
            </button>
        </li>
    );
}

interface TriggerProps {
    children: ReactElement<any>;
    triggerClassName?: string;
}

export const Trigger = ({children, triggerClassName, ...rest}: TriggerProps) => {
    const child = children;

    const {open, onOpenChange, anchorRef} = useSelectContext();

    const originalRef = getElementRef(child);
    const mergedRef = useMergeRefsLoose(anchorRef, originalRef);

    return cloneElement(child, {
        ref: mergedRef,
        className: cn(TRIGGER_CLASS, triggerClassName, child.props.className),
        onClick: (e: MouseEvent) => {
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

export const RotateIcon = (
    {
        children,
        opacity,
    }: {
        children?: ReactNode,
        opacity?: number
    }
) => {
    const {open, duration, exitDuration} = useSelectContext()
    return (
        <span
            className={"inline-block text-sm"}
            style={{
                opacity: opacity ?? 0.5,
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: `transform ${open ? duration : exitDuration}ms ease-in-out`,
            }}
        >{children ?? <>▼</>}</span>
    )
}

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

    className?: string;
    scale?: number;
}

export const SelectComponent = ({
                                    value,
                                    onValueChange,
                                    open,
                                    onOpenChange,
                                    children,

                                    direction = "bottom",
                                    align = "start",
                                    offset = 4,
                                    duration = 150,
                                    exitDuration = 100,
                                    scale = 95,


                                    // className,
                                }: SelectProps) => {
    // 定位与动画
    const {anchorRef, floatingRef, floatingStyle, floatingPortal, portalMounted} = useFloating({
        open,
        direction,
        align,
        offset,
        duration,
        exitDuration,
        scale
    });

    // 有很多hook，先统一处理和合并绑定，然后分发

    const onClose = useCallback(() => onOpenChange?.(false), [onOpenChange]);
    const {clickOutsideRef, clickOutsideIgnoreRef} = useClickOutsideToClose({open, onClose});
    const {
        focusOutsideRef, focusOutsideIgnoreRef,
        // autoFocusRef
    } = useFocusOutsideToClose({open: portalMounted, onClose});
    const {itemRef} = useKeyboardNavigation({open: portalMounted})

    const mergedAnchor = useMergeRefsLoose(anchorRef, clickOutsideIgnoreRef, focusOutsideIgnoreRef);

    const mergedFloating = useMergeRefsLoose(floatingRef, clickOutsideRef, focusOutsideRef);

    const contextValue = useMemo(() => ({
        value, onValueChange,
        open, onOpenChange,

        anchorRef: mergedAnchor,
        floatingRef: mergedFloating,
        floatingPortal,

        // autoFocusRef,
        itemRef,

        floatingStyle,
        duration,
        exitDuration,
    }), [
        value, onValueChange,
        open, onOpenChange,
        anchorRef, floatingRef, floatingStyle, floatingPortal,
        duration, exitDuration,
    ]);

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
            value={lang} onValueChange={(val) => setLang(val)}
            open={open} onOpenChange={setOpen}>
            <Trigger>
                <Button variant="default">
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

type SelectType = typeof SelectComponent & {
    Trigger: typeof Trigger;
    Content: typeof Content;
    Option: typeof Option;
    RotateIcon: typeof RotateIcon;
};

export const Select = Object.assign(SelectComponent, {
    Trigger,
    Content,
    Option,
    RotateIcon,
}) as SelectType;



