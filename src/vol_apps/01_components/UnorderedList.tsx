import {CheckIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import type {CSSProperties, ReactNode} from "react";

const MENU_CLASS = cn(
    "flex flex-col items-center border w-34",
    "bg-background text-foreground",
    "rounded-md shadow-md",
    "select-none",
    "p-1"
);

const ITEM_CLASS = cn(
    "flex items-center justify-between w-full",
    "h-8 bg-background text-foreground",
    "text-sm rounded-sm",
    "hover:bg-foreground/10",
    "whitespace-nowrap",
    "select-none",
    "p-2"
);

export const UnorderedList = (
    {
        value,
        options,
        handleSelect,
        style,
        menu_className,
        item_className,
        checkIcon_className
    }: {
        value?: string,
        options: {
            value: string;
            label: ReactNode;
        } [],
        handleSelect?: (value: string) => void,
        style?: CSSProperties,

        menu_className?: string,
        item_className?: string,
        checkIcon_className?: string,
    }) => {
    const selectedValue = value || "";

    menu_className = cn(MENU_CLASS, menu_className);
    item_className = cn(ITEM_CLASS, item_className);
    checkIcon_className = cn("size-4", checkIcon_className);

    return (
        <ul className={menu_className} style={style}>
            {options.map(({label, value}) => (
                <li key={value} className={"w-full"}>
                    <button className={item_className} onClick={() => handleSelect?.(value)}>
                        {label}
                        {selectedValue === value && <CheckIcon className={checkIcon_className}/>}
                    </button>
                </li>
            ))}
        </ul>
    )
}

